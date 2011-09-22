using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace BSData.Classes {

   public static class MCVExtentions {

      public static List<SelectListItem> ToSelectList<T>(
          this IEnumerable<T> enumerable,
          Func<T, string> text,
          Func<T, string> value,
          string defaultOption) {
         var items = enumerable.Select(f => new SelectListItem() {
            Text = text(f),
            Value = value(f)
         }).ToList();
         items.Insert(0, new SelectListItem() {
            Text = defaultOption,
            Value = "-1"
         });
         return items;
      }
   }

   public abstract class ToStringController : Controller {

      protected string RenderPartialViewToString() {
         return RenderPartialViewToString(null, null);
      }

      protected string RenderPartialViewToString(string viewName) {
         return RenderPartialViewToString(viewName, null);
      }

      protected string RenderPartialViewToString(object model) {
         return RenderPartialViewToString(null, model);
      }

      protected string RenderPartialViewToString(string viewName, object model) {
         if (string.IsNullOrEmpty(viewName))
            viewName = ControllerContext.RouteData.GetRequiredString("action");

         ViewData.Model = model;

         using (StringWriter sw = new StringWriter()) {
            ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
            ViewContext viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
            viewResult.View.Render(viewContext, sw);

            return sw.GetStringBuilder().ToString();
         }
      }
   }

   public static class Date {

      public static string GetFullDate() { DateTime dt = DateTime.Now; return dt.ToString("yyyy-MM-dd") + ", " + GetWeekDay(dt); }

      private static string GetWeekDay(DateTime dt) {
         int N = Convert.ToInt32(DateTime.Now.DayOfWeek);
         if (N == 0) { return "Sekmadienis"; }
         if (N == 1) { return "Pirmadienis"; }
         if (N == 2) { return "Antradienis"; }
         if (N == 3) { return "Trečiadienis"; }
         if (N == 4) { return "Ketvirtadienis"; }
         if (N == 5) { return "Penktadienis"; }
         else { return "Šeštadienis"; }
      }
   }
}