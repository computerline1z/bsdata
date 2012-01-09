using System;
using System.Diagnostics;

namespace BSData.Classes {

   public class MyEventLog {

      private static void CreateSource(string src, EventLog ELog) {
         if (!EventLog.SourceExists(src)) { EventLog.CreateEventSource(src, "BSData"); }
         ELog.Source = src;
      }

      public static void AddEvent(string Message, string src, bool SendMail = false) {
         EventLog EL = new EventLog(); CreateSource(src, EL);
         if (EventWasWrittenBefore(EL, src)) return;
         EL.WriteEntry(Message, EventLogEntryType.Information, 0);
         if (SendMail) MailHelper.SendMailMessage("saulius@bs.lt", null, "justas@bs.lt", src, Message);
      }

      public static bool EventWasWrittenBefore(EventLog EL, string src) {
         int Items = 0;
         try { Items = (EL.Entries.Count > 20) ? 20 : EL.Entries.Count; }
         catch { }

         for (int count = 0; count < Items; count++) {
            if (EL.Entries[count].Source == src) {
               System.TimeSpan diff = DateTime.Now.Subtract(EL.Entries[count].TimeWritten);
               if (diff.Minutes < 30) return true;
            }
         }
         return false;
      }

      public static void AddException(Exception e, bool SendMail = false) {
         try {
            string src = "BSData klaida";
            EventLog EL = new EventLog(); CreateSource(src, EL);
            //if (EventWasWrittenBefore(EL, src)) return;

            System.Diagnostics.StackTrace st = new System.Diagnostics.StackTrace(e, true);
            StackFrame sf = st.GetFrame(0);//0??
            string Msg = "<table><tr><td>Metodas:</td><td>" + sf.GetMethod().Name + Environment.NewLine;
            //string src = "Klaida BSSaugoj";
            Msg += "</td></tr><tr><td>Failas:</td><td>" + sf.GetFileName() + Environment.NewLine;
            Msg += "</td></tr><tr><td>Eilutė faile:</td><td>" + sf.GetFileLineNumber().ToString() + Environment.NewLine;
            Msg += "</td></tr><tr><td>Klaidos tekstas:</td><td>" + e.Message + Environment.NewLine;
            Msg += "</td></tr><tr><td>Source:</td><td>" + e.Source + Environment.NewLine;
            string d = "";
            //foreach (KeyValuePair<String, String> entry in e.Data) {
            //   d += entry.Key.ToString() + ":" + entry.Value.ToString();
            //}
            Msg += "</td></tr><tr><td>Data:</td><td>" + d + "</td></tr></table>";
            EL.WriteEntry(Msg, EventLogEntryType.Error, 999);
            if (SendMail) MailHelper.SendMailMessage("saulius@bs.lt", null, "justas@bs.lt", src, Msg);
         }
         catch (Exception ex) { MyEventLog.AddEvent(ex.Message + "" + ex.Data, "Klaida AddException"); }
      }

      public static void AddWarning(string Message, string src, bool SendMail = false) {
         EventLog EL = new EventLog(); CreateSource(src, EL);
         if (EventWasWrittenBefore(EL, src)) return;

         EL.WriteEntry(Message, EventLogEntryType.Warning, 1);
         if (SendMail) MailHelper.SendMailMessage("saulius@bs.lt", null, "justas@bs.lt", src, Message);
      }
   }
}