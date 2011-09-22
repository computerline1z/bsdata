using System;
using System.Globalization;

namespace BSData.Classes {

   /// <summary>
   /// Summary description for Converters
   /// </summary>
   public static class Converters {

      public static Guid SafeConvertToGuid(object guid) {
         try {
            if (guid == null)
               return Guid.Empty;
            else
               return (Guid)guid;
         }
         catch (Exception) {
            Guid rzlt;
            string guidString = guid.ToString();
            if (Guid.TryParse(guidString, out rzlt))
               return rzlt;
            else
               return Guid.Empty;
         }
      }

      public static int SafeConvertToInt(object intValue) {
         try {
            if (intValue == null)
               return -1;
            else
               return (int)intValue;
         }
         catch (Exception) {
            string tmp = intValue.ToString();
            int rzlt;
            if (!Int32.TryParse(tmp, out rzlt))
               rzlt = -1;
            return rzlt;
         }
      }

      public static decimal SafeConvertToDecimal(object decimalValue) {
         try {
            if (decimalValue == null)
               return 0.00m;
            else
               return (decimal)decimalValue;
         }
         catch (Exception) {
            NumberStyles style = NumberStyles.AllowDecimalPoint;
            CultureInfo culture = (CultureInfo)CultureInfo.InvariantCulture.Clone();
            string tmp = decimalValue.ToString().Trim().Replace(" ", "").Replace(",", ".");

            double rzlt;
            if (!Double.TryParse(tmp, style, culture, out rzlt))
               rzlt = 0.00;
            return (decimal)rzlt;
         }
      }

      public static long SafeConvertToLong(object intValue) {
         try {
            if (intValue == null)
               return -1L;
            else
               return (long)intValue;
         }
         catch (Exception) {
            string tmp = intValue.ToString();
            long rzlt;
            if (!Int64.TryParse(tmp, out rzlt))
               rzlt = -1L;
            return rzlt;
         }
      }

      public static DateTime SafeConvertToDate(object dateValue) {
         try {
            if (dateValue == null)
               return DateTime.Now;
            else
               return (DateTime)dateValue;
         }
         catch (Exception) {
            string tmp = dateValue.ToString();
            DateTime rzlt;
            if (!DateTime.TryParse(tmp, out rzlt))
               rzlt = DateTime.Now;
            return rzlt;
         }
      }

      public static DateTime RemoveHours(DateTime date) {
         int year = date.Year;
         int month = date.Month;
         int day = date.Day;
         return new DateTime(year, month, day);
      }
   }
}