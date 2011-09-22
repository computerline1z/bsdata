using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using System.Web.Security;
using BSData.Classes;

namespace BSData.Models {
   #region Models

   public class ChangePasswordModel {

      [Required]
      [DataType(DataType.Password)]
      [Display(Name = "Dabartinis slaptažodis")]
      public string OldPassword { get; set; }

      [Required]
      [ValidatePasswordLength]
      [DataType(DataType.Password)]
      [Display(Name = "Naujas slaptažodis")]
      public string NewPassword { get; set; }

      [DataType(DataType.Password)]
      [Display(Name = "Slaptažodžio pakartojimas")]
      [Compare("NewPassword", ErrorMessage = "Naujas ir pakartotas slaptažodžiai turi sutapti.")]
      public string ConfirmPassword { get; set; }
   }

   public class LogOnModel {

      public LogOnModel() { }

      public LogOnModel(string _Name, string _Password) { this.Email = _Name; this.Password = _Password; this.RememberMe = false; }

      [Display(Name = "Naudotojo e-paštas:")]
      public string Email { get; set; }

      [DataType(DataType.Password)]
      [Display(Name = "Slaptažodis:")]
      public string Password { get; set; }

      [Display(Name = "Prisiminti mane šiame kompiuteryje")]
      public bool RememberMe { get; set; }
   }

   public class RegisterModel {

      public RegisterModel() {
         using (dbDataContext db = new dbDataContext(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString)) {
            this.SubDeps = db.tblUsers_SubDeps.ToSelectList(d => d.tblUsers_Dep.Name + "-" + d.Name, d => d.ID.ToString(), "-");
         }
      }

      [Required(ErrorMessage = "Įrašykite savo būsimos pareigybės pavadinimą")]
      [StringLength(50, ErrorMessage = "Sutrumpinkit pareigybės pavadinimą iki 50 simbolių")]
      [Display(Name = "Pareigybė")]
      public string Position { get; set; }

      [Required(ErrorMessage = "Įrašykite savo vardą")]
      [Display(Name = "Vardas")]
      [StringLength(35, ErrorMessage = "Vardas negali būt ilgesnis negu 35 simboliai")]
      public string Name { get; set; }

      [Required(ErrorMessage = "Įrašykite savo pavardę")]
      [Display(Name = "Pavardė")]
      [StringLength(35, ErrorMessage = "Pavardė negali būt ilgesnė negu 35 simboliai")]
      public string LastName { get; set; }

      [Display(Name = "Gimimo data")]
      [RegularExpression(@"(19|20)\d\d[- /.]([1-9]|1[012])[- /.]([1-9]|[12][0-9]|3[01] 00:00:00)$", ErrorMessage = "Gimimo data turi būti taisyklinga data")]
      //public DateTime Birthday { get; set; }

      private DateTime _Birthday;

      public DateTime Birthday {
         get {
            return _Birthday;
         }
         set {
            Match m = Regex.Match("abracadabra", "(a|b|r)+");
            _Birthday = value;
         }
      }

      [Required(ErrorMessage = "Įrašykite datą nuo kada pradėsite/ pradėjote dirbti")]
      [Display(Name = "Darbo pradžia")]
      //[RegularExpression(@"(19|20)\d\d[- /.]([1-9]|1[012])[- /.]([1-9]|[12][0-9]|3[01])", ErrorMessage = "Darbo pradžia turi būti data")]
      [RegularExpression("^(2011[-/.]08[-/.]04 00:00:00)$", ErrorMessage = "Darbo pradžia turi būti data")]
      //[RegularExpression("^(2011[-/.]08)$", ErrorMessage = "Darbo pradžia turi būti data")]
      //public DateTime Work_from { get; set; }
      private DateTime _Work_from;

      public DateTime Work_from {
         get {
            return _Work_from;
         }
         set {
            _Work_from = value;
         }
      }

      private int _SubDepID;

      [Required(ErrorMessage = "Pasirinkite skyrių kuriame dirbsite1")]//Cia bus SelectListas
      [Range(0, 20, ErrorMessage = "Pasirinkite skyrių kuriame dirbsite2")]//Cia bus SelectListas
      //[RegularExpression(@"^([1-9]\d*)$", ErrorMessage = "Ne tokis skyrius")]
      [Display(Name = "Skyrius")]
      public int SubDepID {
         get {
            return _SubDepID;
         }
         set {
            _SubDepID = value;
         }
      }

      //public int SubDepID {
      //   get;
      //   set;
      //}

      public List<SelectListItem> SubDeps { get; set; }

      [Display(Name = "Mobilus telefonas")]
      [RegularExpression("^([0-9]{5,8})$", ErrorMessage = "Telefono numeris turi būt sveikas skaičius iki 8 numerių")]
      public int? Phone_mob { get; set; }

      [Display(Name = "Darbo telefonas")]
      [RegularExpression("^([0-9]{5,8})$", ErrorMessage = "Telefono numeris turi būt sveikas skaičius iki 8 numerių")]
      public int? Phone_work { get; set; }

      [Required(ErrorMessage = "Reikalinga nurodyti savo e-pašto adresą")]
      [DataType(DataType.EmailAddress, ErrorMessage = "Formatas neatitinka pašto adreso")]
      [Display(Name = "El. paštas:")]
      [RegularExpression("^(?i)[a-z0-9_\\+-]+(\\.[a-z0-9_\\+-]+)*(@bs.lt)$", ErrorMessage = "Neteisingas pašto adresas - turi panašus į vardas@bs.lt")]
      public string Email { get; set; }

      public string Address { get; set; }
   }

   public class RegisterOKModel {

      public Guid UserId { get; set; }

      public string Email { get; set; }

      public string Mailer { get; set; }

      public string UserName { get; set; }
   }

   public class ChangeEmailModel {

      public Guid UserId { get; set; }

      [Required]
      [DataType(DataType.EmailAddress)]
      [Display(Name = "Sistemoje registruotas el. paštas:")]
      public string OldEmail { get; set; }

      [Required]
      [DataType(DataType.EmailAddress)]
      [Display(Name = "Naujas el. paštas:")]
      [RegularExpression("^(?i)[a-z0-9_\\+-]+(\\.[a-z0-9_\\+-]+)*(@bs.lt)$", ErrorMessage = "Neteisingas pašto adresas - turi panašus į vardas@bs.lt")]
      public string Email { get; set; }
   }

   public class NewPasswordModel {

      [Required]
      [ValidatePasswordLength]
      [DataType(DataType.Password)]
      [Display(Name = "Pasirinkite slaptažodį:")]
      public string Password { get; set; }

      [DataType(DataType.Password)]
      [Display(Name = "Pakartokite slaptažodį:")]
      [Compare("Password", ErrorMessage = "Slaptažodis ir jo patvirtinimas privalo būti vienodi.")]
      public string ConfirmPassword { get; set; }
   }

   public class RecoverPasswordModel {

      [Required]
      [DataType(DataType.EmailAddress)]
      [Display(Name = "Pašto adresas:")]
      [RegularExpression("^[a-z0-9_\\+-]+(\\.[a-z0-9_\\+-]+)*(@bs.lt)$", ErrorMessage = "Neteisingas pašto adresas")]
      public string Email { get; set; }

      internal RecoverPasswordModel(string currentUserName) {
         //MembershipUser aUser = Membership.GetUser(currentUserName);
         //PasswordQuestion = aUser.PasswordQuestion;
         //Email = aUser.Email;
      }

      public RecoverPasswordModel() {
      }
   }

   public class HeaderModel {

      public string Title { get; set; }
   }

   #endregion Models

   #region Services

   // The FormsAuthentication type is sealed and contains static members, so it is difficult to
   // unit test code that calls its members. The interface and helper class below demonstrate
   // how to create an abstract wrapper around such a type in order to make the AccountController
   // code unit testable.

   public interface IMembershipService {

      int MinPasswordLength { get; }

      bool ValidateUser(string userName, string password);

      MembershipCreateStatus CreateUser(string userName, string password, string email);

      bool ChangePassword(string userName, string oldPassword, string newPassword);
   }

   public class AccountMembershipService : IMembershipService {
      private readonly MembershipProvider _provider;

      public AccountMembershipService()
         : this(null) {
      }

      public AccountMembershipService(MembershipProvider provider) {
         _provider = provider ?? Membership.Provider;
      }

      public int MinPasswordLength {
         get {
            return _provider.MinRequiredPasswordLength;
         }
      }

      public bool ValidateUser(string userName, string password) {
         if (String.IsNullOrEmpty(userName)) throw new ArgumentException("Value cannot be null or empty.", "userName");
         if (String.IsNullOrEmpty(password)) throw new ArgumentException("Value cannot be null or empty.", "password");

         return _provider.ValidateUser(userName, password);
      }

      public MembershipCreateStatus CreateUser(string userName, string password, string email) {
         if (String.IsNullOrEmpty(userName)) throw new ArgumentException("Value cannot be null or empty.", "userName");
         if (String.IsNullOrEmpty(password)) throw new ArgumentException("Value cannot be null or empty.", "password");
         if (String.IsNullOrEmpty(email)) throw new ArgumentException("Value cannot be null or empty.", "email");

         MembershipCreateStatus status;
         _provider.CreateUser(userName, password, email, null, null, true, null, out status);
         return status;
      }

      public bool ChangePassword(string userName, string oldPassword, string newPassword) {
         if (String.IsNullOrEmpty(userName)) throw new ArgumentException("Value cannot be null or empty.", "userName");
         if (String.IsNullOrEmpty(oldPassword)) throw new ArgumentException("Value cannot be null or empty.", "oldPassword");
         if (String.IsNullOrEmpty(newPassword)) throw new ArgumentException("Value cannot be null or empty.", "newPassword");

         // The underlying ChangePassword() will throw an exception rather
         // than return false in certain failure scenarios.
         try {
            MembershipUser currentUser = _provider.GetUser(userName, true /* userIsOnline */);
            return currentUser.ChangePassword(oldPassword, newPassword);
         }
         catch (ArgumentException) {
            return false;
         }
         catch (MembershipPasswordException) {
            return false;
         }
      }
   }

   public interface IFormsAuthenticationService {

      void SignIn(string userName, bool createPersistentCookie);

      void SignOut();
   }

   public class FormsAuthenticationService : IFormsAuthenticationService {

      public void SignIn(string userName, bool createPersistentCookie) {
         if (String.IsNullOrEmpty(userName)) throw new ArgumentException("Value cannot be null or empty.", "userName");

         FormsAuthentication.SetAuthCookie(userName, createPersistentCookie);
      }

      public void SignOut() {
         FormsAuthentication.SignOut();
      }
   }

   #endregion Services

   #region Validation

   public static class AccountValidation {

      public static string ErrorCodeToString(MembershipCreateStatus createStatus) {
         // See http://go.microsoft.com/fwlink/?LinkID=177550 for
         // a full list of status codes.
         switch (createStatus) {
            case MembershipCreateStatus.DuplicateUserName:
               return "Toks vartotojas jau yra. Pasirinkite kitą vartotojo vardą";

            case MembershipCreateStatus.DuplicateEmail:
               return "Toks e-pašto adresas jau yra sistemoje. Įveskite kitą.";

            case MembershipCreateStatus.InvalidPassword:
               return "Neteisingas slaptažodis. Įveskite teisingą slaptažodį";

            case MembershipCreateStatus.InvalidEmail:
               return "Neteisingas e-pašto formatas. Pasitikrinkite ir pakeiskite";

            case MembershipCreateStatus.InvalidAnswer:
               return "The password retrieval answer provided is invalid. Please check the value and try again.";

            case MembershipCreateStatus.InvalidQuestion:
               return "The password retrieval question provided is invalid. Please check the value and try again.";

            case MembershipCreateStatus.InvalidUserName:
               return "The user name provided is invalid. Please check the value and try again.";

            case MembershipCreateStatus.ProviderError:
               return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

            case MembershipCreateStatus.UserRejected:
               return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

            default:
               return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
         }
      }
   }

   [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
   public sealed class ValidatePasswordLengthAttribute : ValidationAttribute, IClientValidatable {
      private const string _defaultErrorMessage = "'{0}' must be at least {1} characters long.";
      private readonly int _minCharacters = Membership.Provider.MinRequiredPasswordLength;

      public ValidatePasswordLengthAttribute()
         : base(_defaultErrorMessage) {
      }

      public override string FormatErrorMessage(string name) {
         return String.Format(CultureInfo.CurrentCulture, ErrorMessageString,
             name, _minCharacters);
      }

      public override bool IsValid(object value) {
         string valueAsString = value as string;
         return (valueAsString != null && valueAsString.Length >= _minCharacters);
      }

      public IEnumerable<ModelClientValidationRule> GetClientValidationRules(ModelMetadata metadata, ControllerContext context) {
         return new[]{
                new ModelClientValidationStringLengthRule(FormatErrorMessage(metadata.GetDisplayName()), _minCharacters, int.MaxValue)
            };
      }
   }

   #endregion Validation
}