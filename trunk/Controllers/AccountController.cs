using System;
using System.Configuration;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using BSData.Classes;
using BSData.Models;

namespace ClaimsControl.Controllers {

   public class AccountController : Controller {
      private string currentUserIdKey = "{799B06C7-CD4C-4F52-B39C-6E573A3A2727}";

      public IFormsAuthenticationService FormsService { get; set; }

      //public BSMemProvider MembershipService { get; set; }

      protected override void Initialize(RequestContext requestContext) {
         if (FormsService == null) { FormsService = new FormsAuthenticationService(); }
         //if (MembershipService == null) { MembershipService = new BSMemProvider(); }

         base.Initialize(requestContext);
      }

      // **************************************
      // URL: /Account/LogOn
      // **************************************

      public ActionResult LogOn() {
         return View();
      }

      [HttpPost]
      public ActionResult LogOn(LogOnModel model, string returnUrl, string submitButton) {
         if (ModelState.IsValid) {
            var currentUserName = Membership.GetUserNameByEmail(model.Email);
            if (currentUserName == null) {
               ModelState.AddModelError("", String.Format("{0} - Nežinomas e-paštas.", model.Email));
               return View(model);
            }
            return performLogonAction(model, returnUrl, currentUserName);
         }
         return View(model);
      }

      private ActionResult performLogonAction(LogOnModel model, string returnUrl, string currentUserName) {
         if (String.IsNullOrEmpty(model.Password)) {
            ModelState.AddModelError("", "Būtina nurodyti slaptažodį.");
            return View(model);
         }
         if (ModelState.IsValid) {
            if (Membership.ValidateUser(currentUserName, model.Password)) {
               FormsService.SignIn(model.Email, model.RememberMe);
               if (Url.IsLocalUrl(returnUrl)) {
                  return Redirect(returnUrl);
               }
               else {
                  return RedirectToAction("Start", "Title");
               }
            }
            else {
               MembershipUser aUser = Membership.GetUser(currentUserName);
               if (!aUser.IsApproved)
                  ModelState.AddModelError("", "Paskyra neaktyvuota. " +
                      "Atidarykite registracijos metu gautą laišką ir paspauskite aktyvavimo nuorodą.");
               else if (aUser.IsLockedOut)
                  ModelState.AddModelError("", "Jūsų paskyra užblokuota nes buvo per daug nesėkmingų bandymų prisiregistruoti. " +
                      "Kreipkitės į sistemos administratorių.");
               else
                  ModelState.AddModelError("", "Neteisingas slaptažodis.");
            }
         }
         return View(model);
      }

      // **************************************
      // URL: /Account/RecoverPassword
      // **************************************
      [HttpGet]
      public ActionResult RecoverPassword() {
         var model = new RecoverPasswordModel();      //(currentUserName);
         return View(model);
      }

      [HttpPost]
      public ActionResult RecoverPassword(RecoverPasswordModel model) {
         if (ModelState.IsValid) {
            string currentUserName = Membership.GetUserNameByEmail(model.Email);
            if (String.IsNullOrEmpty(currentUserName)) {
               ModelState.AddModelError("EMail", String.Format("{0} - Neteisingas pašto addresas.", model.Email));
               return View(model);
            }
            MembershipUser aUser = Membership.GetUser(currentUserName);

            SendPasswordChangedMail(aUser.UserName, model.Email, (Guid)aUser.ProviderUserKey);
            ModelState.AddModelError("", "Laiškas iškeliavo!");
            return View(model);
         }
         ModelState.AddModelError("", "Nežinoma klaida. Susisiekite su sistemos administratorium");
         return View(model);
      }

      private void SendPasswordChangedMail(string userName, string email, Guid UserId) {
         var x = this.HttpContext.Request;// UserData.UserName
         RegisterModel model = new RegisterModel();
         string url = x.Url.Scheme + @"://" + x.Url.Authority + "/Account/NewPassword/" + UserId.ToString();
         string messageBody = MailHelper.BuildMailMessage(this.HttpContext, "lt", "ConfirmRegistration", url, UserData.UserName, email); MailHelper.SendMailMessage(model.Email, String.Empty, String.Empty, "Registracija 'BSData' sistemoje", messageBody);

         MailHelper.SendMailMessage(email, String.Empty, String.Empty, "Slaptažodio keitimas informacijos valdymo sistemoje", messageBody);
      }

      // **************************************
      // URL: /Account/LogOff
      // **************************************

      [Authorize]
      public ActionResult LogOff() {
         FormsService.SignOut();

         return RedirectToAction("LogOn", "Account");
      }

      // **************************************
      // URL: /Account/Register
      // **************************************

      public ActionResult Register() {
         RegisterModel rm = null;
         using (dbDataContext db = new dbDataContext(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString)) {
            rm = new RegisterModel();
         }
         return View("Register", rm);
      }

      /// <summary>
      /// Registers new user
      /// Membership.Comments saugo paskyros pavadinima
      /// </summary>
      /// <param name="model"><see cref="RegisterModel"/></param>
      /// <returns>RegisterOK view or existsing view with an error message</returns>
      [HttpPost]
      public ActionResult Register(RegisterModel model) {
         if (!ModelState.IsValid) {
            ModelState.AddModelError("", "Užpildykite būtinus laukus.");
            return View(model);
         }

         string passwd = Membership.GeneratePassword(8, 2);
         MembershipUser aUser = null;
         try { aUser = Membership.CreateUser(model.Email, passwd, model.Email); }
         catch (Exception e) {
            ModelState.AddModelError("", e.Message);
            return View(model);
         }

         //aUser.Comment = model.UserName;
         Membership.UpdateUser(aUser);
         using (dbDataContext db = new dbDataContext(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString)) {
            //int SubDepID = model.SubDepID;
            //if (!Int32.TryParse(model.SubDepID, out SubDepID)) {
            //   SubDepID = (from acc in db.tblUsers_SubDeps select acc.ID).FirstOrDefault();
            //}
            int? ID = 0;
            db.proc_tblUsers_InsertNew(ref ID, model.Position, model.Name, model.LastName, model.Birthday, model.Work_from, model.SubDepID, model.Phone_mob, model.Phone_work, model.Email, model.Address);
         }
         SendConfirmationMail(model, (Guid)aUser.ProviderUserKey);
         this.TempData[currentUserIdKey] = aUser.ProviderUserKey.ToString();
         return RedirectToAction("RegisterOK", "Account");
      }

      private void SendConfirmationMail(RegisterModel model, Guid UserId) {
         var x = this.HttpContext.Request;
         string url = x.Url.Scheme + @"://" + x.Url.Authority + "/Account/NewPasswordComfirm/" + UserId.ToString();
         string messageBody = MailHelper.BuildMailMessage(this.HttpContext, "lt", "ConfirmRegistration", url, model.Name + " " + model.LastName, model.Email); MailHelper.SendMailMessage(model.Email, String.Empty, String.Empty, "Registracija 'BSData' sistemoje", messageBody);
      }

      /// <summary>
      /// Return lithuanian error messages.
      /// </summary>
      /// <param name="status"><see cref="MembershipCreateStatus"/></param>
      /// <param name="model"><see cref="RegisterModel"/></param>
      /// <returns></returns>
      private string GetErrorMessage(MembershipCreateStatus status, RegisterModel model) {
         switch (status) {
            case MembershipCreateStatus.DuplicateUserName:
               return String.Format("{0} jau užregistruotas. Pasirinkite kitą el. paštą.", model.Email);

            case MembershipCreateStatus.DuplicateEmail:
               return String.Format("Pašto dėžutė {0} jau užregistruota sistemoje. Panaudokite kitą REALŲ pašto adresą.", model.Email);

            case MembershipCreateStatus.InvalidPassword:
               return "Neteisingas slaptažodis. Sukurkite kitą 6 simbolių kombinaciją.";

            case MembershipCreateStatus.InvalidEmail:
               return String.Format("{0} - neteisingas pašto adreso formatas. Patikrinkite adresą ir įveskite teisingą reikšmę.", model.Email);

            case MembershipCreateStatus.InvalidUserName:
               return String.Format("{0} - neteisingas prisijungimo vardas. Patikrinkite reikšmę ir pakartokite registravimą.", model.Email);

            case MembershipCreateStatus.ProviderError:
               return "MS SQL vartotojų registravimo sistema atmetė jūsų registravimą. Pakartokite registraciją. Pasikartojus klaidai kreipkitės į sistemos administratorių.";

            case MembershipCreateStatus.UserRejected:
               return "Registracija buvo nutraukta. Pakartokite registraciją. Pasikartojus klaidai kreipkitės į sistemos administratorių.";

            default:
               return "Nežinoma sistemos klaida. Pakartokite registraciją. Pasikartojus klaidai kreipkitės į sistemos administratorių.";
         }
      }

      // **************************************
      // URL: /Account/RegisterOK
      // **************************************

      public ActionResult RegisterOK() {
         Guid userId = Guid.Parse((string)this.TempData[currentUserIdKey]);
         MembershipUser aUser = Membership.GetUser(userId);

         var model = new RegisterOKModel() {
            UserId = userId,
            Email = aUser.Email,
            Mailer = "mailto:" + aUser.Email,
         };

         TempData[currentUserIdKey] = userId.ToString();
         return View(model);
      }

      public ActionResult RegisterOK_1(string id) {
         Guid userId = Guid.Parse(id);
         MembershipUser aUser = Membership.GetUser(userId);

         var model = new RegisterOKModel() {
            UserId = userId,
            Email = aUser.Email,
            UserName = aUser.Comment,
         };

         var x = this.HttpContext.Request;
         string url = x.Url.Scheme + @"://" + x.Url.Authority + "/Account/NewPasswordComfirm/" + id;
         string messageBody = MailHelper.BuildMailMessage(this.HttpContext, "lt", "ConfirmRegistration", url, model.UserName, model.Email); MailHelper.SendMailMessage(model.Email, String.Empty, String.Empty, "Registracija 'BSData' sistemoje", messageBody);

         MailHelper.SendMailMessage(model.Email, String.Empty, String.Empty, "Registracija informacijos valdymo sistemoje", messageBody);

         TempData[currentUserIdKey] = userId.ToString();
         return View("RegisterOK", model);
      }

      // **************************************
      // URL: /Account/ChangeEmail
      // **************************************
      [HttpGet]
      public ActionResult ChangeEmail(string id) {
         Guid userId = Guid.Parse(id);
         MembershipUser aUser = Membership.GetUser(userId);

         var model = new ChangeEmailModel() {
            UserId = userId,
            OldEmail = aUser.Email,
            Email = aUser.Email,
         };

         TempData[currentUserIdKey] = userId.ToString();
         return View("ChangeEmail", model);
      }

      [HttpPost]
      public ActionResult ChangeEmail(ChangeEmailModel model) {
         Guid userId = Guid.Parse((string)TempData[currentUserIdKey]);
         MembershipUserCollection collection = Membership.FindUsersByEmail(model.Email);
         if (collection.Count > 0) {
            foreach (MembershipUser aUser in collection) {
               if ((Guid)aUser.ProviderUserKey != userId) {
                  ModelState.AddModelError("", String.Format("{0} - jau užregistruotas sistemoje.", model.Email));
                  TempData[currentUserIdKey] = userId.ToString();
                  return View();
               }
            }
         }
         MembershipUser currentUser = Membership.GetUser(userId);
         currentUser.Email = model.Email;
         Membership.UpdateUser(currentUser);

         return RedirectToAction("LogOn");
      }

      // **************************************
      // URL: /Account/NewPassword
      // **************************************
      public ActionResult NewPassword(string Id) {
         TempData[currentUserIdKey] = Id;
         return View("NewPassword");
      }

      /// <summary>
      /// Activate user
      /// </summary>
      /// <param name="model"><see cref="RegisterModel"/></param>
      /// <returns>RegisterOK view or existsing view with an error message</returns>
      [HttpPost]
      public ActionResult NewPassword(NewPasswordModel model) {
         Guid? userId = null;
         try {
            if (TempData[currentUserIdKey] == null)
               throw new Exception("Paspauskite nuorodą laiške, kuris buvo atsiųstas į jūsų el. pašto dėžutę.");
            userId = Guid.Parse((string)TempData[currentUserIdKey]);
            MembershipUser currentUser = Membership.GetUser(userId);

            if (ModelState.IsValid) {
               string tmpPasswd = currentUser.ResetPassword();
               currentUser.ChangePassword(tmpPasswd, model.Password);
               Membership.UpdateUser(currentUser);

               return RedirectToAction("LogOn");
            }
         }
         catch (Exception ex) {
            ModelState.AddModelError("", ex.Message);
         }
         // If we got this far, something failed, redisplay form
         if (userId.HasValue)
            TempData[currentUserIdKey] = userId.Value.ToString();
         return View("NewPassword");
      }

      public ActionResult NewPasswordComfirm(string Id) {
         TempData[currentUserIdKey] = Id;
         return View("NewPassword");
      }

      [HttpPost]
      public ActionResult NewPasswordComfirm(NewPasswordModel model) {
         Guid? userId = null;
         try {
            if (TempData[currentUserIdKey] == null)
               throw new Exception("Paspauskite nuorodą laiške, kuris buvo atsiųstas į jūsų el. pašto dėžutę.");
            userId = Guid.Parse((string)TempData[currentUserIdKey]);
            MembershipUser currentUser = Membership.GetUser(userId);
            if (currentUser == null)
               throw new Exception("Laikinas prisijungimas nebegalioja. Bandykite registruotis iš naujo.");

            if (ModelState.IsValid) {
               string tmpPasswd = currentUser.ResetPassword();
               currentUser.ChangePassword(tmpPasswd, model.Password);
               currentUser.IsApproved = true;
               Membership.UpdateUser(currentUser);

               //return RedirectToAction("LogOn");
               LogOnModel LOModel = new LogOnModel(currentUser.ToString(), model.Password);
               return performLogonAction(LOModel, null, currentUser.ToString());
            }
         }
         catch (Exception ex) {
            ModelState.AddModelError("", ex.Message);
         }
         // If we got this far, something failed, redisplay form

         if (userId.HasValue)
            TempData[currentUserIdKey] = userId.Value.ToString();
         return View("NewPassword");
      }

      // **************************************
      // URL: /Account/Sutartis
      // **************************************
      public ActionResult Sutartis() {
         return View("Sutartis");
      }

      // **************************************
      // URL: /Account/ChangePasswordSuccess
      // **************************************

      [Authorize]
      public ActionResult ChangePasswordSuccess() {
         return View();
      }

      public ActionResult Header() {
         var model = new HeaderModel();
         model.Title = ConfigurationManager.AppSettings["ProgramName"];
         return View("Header", model);
      }
   }
}