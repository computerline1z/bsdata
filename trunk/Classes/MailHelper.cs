using System;
using System.IO;
using System.Net.Mail;
using System.Web;

//using msOutlook =  Microsoft.Office.Interop.Outlook;

namespace BSData.Classes {

    /// <summary>
    /// Summary description for MailHelper
    /// </summary>
    public static class MailHelper {
        //public MailHelper() {
        //}

        /// <summary>
        /// Sends an mail message
        /// </summary>
        /// <param name="from">Sender address</param>
        /// <param name="to">Recepient address</param>
        /// <param name="bcc">Bcc recepient</param>
        /// <param name="cc">Cc recepient</param>
        /// <param name="subject">Subject of mail message</param>
        /// <param name="body">Body of mail message</param>
        public static void SendMailMessage(string to, string bcc, string cc, string subject, string body) {
            var mMailMessage = new MailMessage() {
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
                Priority = MailPriority.Normal,
            };
            mMailMessage.To.Add(new MailAddress(to));
            if (!String.IsNullOrEmpty(bcc))
                mMailMessage.Bcc.Add(new MailAddress(bcc));
            if (!String.IsNullOrEmpty(cc))
                mMailMessage.CC.Add(new MailAddress(cc));
            var mSmtpClient = new SmtpClient();
            try { mSmtpClient.Send(mMailMessage); }
            catch (Exception e) {
                MyEventLog.AddException(e);
            }
        }

        //public static string BuildMailMessage(HttpContextBase context, string language,
        //                                      string paskyra, string email, string password,
        //                                      string homeUrl, string bodyName) {
        public static string BuildMailMessage(HttpContextBase context, string language, string template, string homeUrl, string User, string Email) {
            string relativePath = String.Format("~/App_Data/Mail.{0}.{1}.htm", template, language);
            string absolutePath = context.Server.MapPath(relativePath);
            if (!File.Exists(absolutePath)) {
                MyEventLog.AddException(new Exception( "Nėra failo: " + relativePath+" - sub BuildMailMessage"),true);
                throw new Exception(String.Format("WEP applikacija neturi failo '{0}'.", relativePath));
            }
            string body = File.ReadAllText(absolutePath);
            body = body.Replace("/*user*/", User).Replace("/*email*/", Email).Replace("/*homeUrl*/", homeUrl);

            body = body.Replace("/*date*/", DateTime.Now.ToString("yyyy.MM.dd"));
            return body;
        }
    }
}