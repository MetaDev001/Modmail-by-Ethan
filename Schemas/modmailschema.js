const { model, Schema } = require("mongoose");
 
let modmail = new Schema({
    Guild: String,
    Category: String,
    Logs: String
});
 
module.exports = model("modmail", modmail);