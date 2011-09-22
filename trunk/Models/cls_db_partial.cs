using System.Configuration;

namespace BSData.Models {

   public class cls_db_partial {
   }

   //public partial class dbDataContext {
   //   public dbDataContext()
   //      : base(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString, mappingSource) {
   //      OnCreated();
   //   }
   //}

   public partial class dbDataContext : System.Data.Linq.DataContext {

      partial void OnCreated() {
         string ConStr;
         if (ConfigurationManager.ConnectionStrings["BSConStr"] == null) { ConStr = @"Data Source=SAULIUSB\SQLEXPRESS;Initial Catalog=BS;Integrated Security=True"; }
         else { ConStr = ConfigurationManager.ConnectionStrings["BSConStr"].ToString(); }
         this.Connection.ConnectionString = ConStr;
      }
   }
}