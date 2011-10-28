using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web;
using BSData.Classes;
using BSData.Models;

namespace CC.Models {
   public interface IUpdate {

      jsonResponse AddNew(string[] Data, string[] Fields, string DataTable, string Ext, DateTime? Date);

      jsonResponse Edit(Int32 id, string Data, string Field, string DataTable, string Ext);

      jsonResponse Delete(Int32 id, string DataTable, string Ext);

      int InsertFileData(HttpPostedFileBase fileBase, UploadedFilePars Pars);
   }

   public class Repositories_Update {
      private static string conStr = ConfigurationManager.ConnectionStrings["BSConStr"].ToString();

      //public Repositories_Update(){ }
      private string GetStringFromArrSpec(string[] Arr) {
         if (Arr == null) return "null";
         for (int i = 0; i < Arr.GetLength(0); i++) { if (Arr[i] == null || Arr[i] == "") Arr[i] = "null"; }//Nes null jei bus ant join teliks null
         return string.Join("#|#", Arr);
      }

      private string GetStringFromArrComma(string[] Arr) { return string.Join(",", Arr); }

      public jsonResponse AddNew(string[] Data, string[] Fields, string DataObject, string Ext, DateTime? Date) {
         jsonResponse JsonResp = new jsonResponse { ErrorMsg = "", ResponseMsg = "" };
         SqlConnection con = new SqlConnection(conStr);
         SqlCommand cmd = new SqlCommand("proc_Update_AddNew", con);
         cmd.CommandType = System.Data.CommandType.StoredProcedure;
         cmd.Parameters.AddWithValue("@TableName", DataObject.Trim());
         cmd.Parameters.AddWithValue("@Data", GetStringFromArrSpec(Data));//Spec duomenu delimiteris, nes ten kbl gali but
         cmd.Parameters.AddWithValue("@Fields", GetStringFromArrComma(Fields));

         SqlParameter Extout = cmd.Parameters.AddWithValue("@Ext", ((Ext == null) ? "" : Ext));
         Extout.SqlDbType = System.Data.SqlDbType.NVarChar;
         Extout.Size = -1;
         Extout.Direction = ParameterDirection.InputOutput;

         SqlParameter IDout = cmd.Parameters.AddWithValue("@ID", 0);
         IDout.Direction = ParameterDirection.InputOutput;

         cmd.Parameters.AddWithValue("@UserID", UserData.UserID);

         if (Date.HasValue) { cmd.Parameters.AddWithValue("@Date", Date.Value); }
         try {
            con.Open(); cmd.ExecuteNonQuery(); Int32 ID = Convert.ToInt32(IDout.Value);
            JsonResp.ResponseMsg = new { ID = ID, Ext = ((Extout.Value != null) ? Convert.ToString(Extout.Value) : "") };
         }
         catch (Exception ex) { JsonResp.ErrorMsg = ex.Message; }
         finally { con.Close(); }
         return JsonResp;
      }

      public jsonResponse Edit(Int32 id, string[] Data, string[] Fields, string DataObject, string Ext) {
         jsonResponse JsonResp = new jsonResponse();
         SqlConnection con = new SqlConnection(conStr);
         SqlCommand cmd = new SqlCommand("proc_Update_Edit", con);
         cmd.CommandType = System.Data.CommandType.StoredProcedure;
         cmd.Parameters.AddWithValue("@TableName", DataObject.Trim());
         cmd.Parameters.AddWithValue("@Data", GetStringFromArrSpec(Data));
         cmd.Parameters.AddWithValue("@Fields", GetStringFromArrComma(Fields));
         cmd.Parameters.AddWithValue("@ID", id);
         cmd.Parameters.AddWithValue("@UserID", UserData.UserID);

         SqlParameter Extout = cmd.Parameters.AddWithValue("@Ext", ((Ext == null) ? "" : Ext));
         Extout.SqlDbType = System.Data.SqlDbType.NVarChar;
         Extout.Size = -1;
         Extout.Direction = ParameterDirection.InputOutput;

         try {
            con.Open(); cmd.ExecuteNonQuery();
            if (Extout.Value != null) { JsonResp.ResponseMsg = new { Ext = ((Extout.Value != null) ? Convert.ToString(Extout.Value) : "") }; }
         }
         catch (Exception ex) { JsonResp.ErrorMsg = ex.Message; }
         finally { con.Close(); }
         return JsonResp;
      }

      public jsonResponse Delete(Int32 id, string DataObject, string Ext) {
         jsonResponse JsonResp = new jsonResponse { ErrorMsg = "", ResponseMsg = "" };
         SqlConnection con = new SqlConnection(conStr);
         SqlCommand cmd = new SqlCommand("proc_Update_Delete", con);
         cmd.CommandType = System.Data.CommandType.StoredProcedure;
         cmd.Parameters.AddWithValue("@TableName", DataObject.Trim());
         cmd.Parameters.AddWithValue("@ID", id);
         cmd.Parameters.AddWithValue("@UserID", UserData.UserID);

         SqlParameter Extout = cmd.Parameters.AddWithValue("@Ext", ((Ext == null) ? "" : Ext));
         Extout.SqlDbType = System.Data.SqlDbType.NVarChar;
         Extout.Size = -1;
         Extout.Direction = ParameterDirection.InputOutput;

         //SqlParameter SuccessMsg = cmd.Parameters.AddWithValue("@SuccessMsg", "");
         //SuccessMsg.SqlDbType = System.Data.SqlDbType.NVarChar;
         //SuccessMsg.Size = -1;
         //SuccessMsg.Direction = ParameterDirection.InputOutput;

         try {
            con.Open(); cmd.ExecuteNonQuery(); { JsonResp.ResponseMsg = new { Ext = ((Extout.Value != null) ? Convert.ToString(Extout.Value) : "") }; }
            //con.Open(); cmd.ExecuteNonQuery(); { JsonResp.ResponseMsg = new { SuccessMsg = ((SuccessMsg.Value != null) ? Convert.ToString(SuccessMsg.Value) : ""), Ext = ((Extout.Value != null) ? Convert.ToString(Extout.Value) : "") }; }
         }
         catch (Exception ex) { JsonResp.ErrorMsg = ex.Message; }
         finally { con.Close(); }
         return JsonResp;
      }

      public UploadResult InsertFilePars(UploadedFilePars Pars) {
         UploadResult ur = new UploadResult();
         SqlConnection con = new SqlConnection(conStr);
         SqlCommand cmd = new SqlCommand("proc_Update_UploadedFiles", con);
         cmd.CommandType = System.Data.CommandType.StoredProcedure;
         cmd.Parameters.AddWithValue("@FileName", Pars.FileName);
         cmd.Parameters.AddWithValue("@tblUpdate", Pars.tblUpdate);
         cmd.Parameters.AddWithValue("@RecID", Pars.RecId);
         cmd.Parameters.AddWithValue("@SizeKB", Pars.SizeKB);
         cmd.Parameters.AddWithValue("@UserID", Pars.UserId);

         SqlParameter FileId = cmd.Parameters.AddWithValue("@FileId", 0);
         FileId.SqlDbType = System.Data.SqlDbType.Int;
         FileId.Direction = ParameterDirection.Output;
         SqlParameter User = cmd.Parameters.AddWithValue("@User", 0);
         User.SqlDbType = System.Data.SqlDbType.NVarChar;
         User.Size = 75;
         User.Direction = ParameterDirection.Output;
         SqlParameter SaveDate = cmd.Parameters.AddWithValue("@SaveDate", 0);
         SaveDate.SqlDbType = System.Data.SqlDbType.Char;
         SaveDate.Size = 10;
         SaveDate.Direction = ParameterDirection.Output;

         //SqlParameter FileId = cmd.Parameters.Add("@FileId", SqlDbType.Int);
         //FileId.Direction = ParameterDirection.Output;
         //SqlParameter User = cmd.Parameters.Add("@User", SqlDbType.NVarChar);
         //FileId.Direction = ParameterDirection.Output;
         //SqlParameter SaveDate = cmd.Parameters.Add("@SaveDate", SqlDbType.Char);
         //FileId.Direction = ParameterDirection.Output;

         try { con.Open(); cmd.ExecuteNonQuery(); ur.SetVal((int)FileId.Value, User.Value.ToString(), SaveDate.Value.ToString()); }
         catch (Exception ex) { ur._Msg = ex.Message; }
         finally { con.Close(); }
         return ur;
      }
   }
}