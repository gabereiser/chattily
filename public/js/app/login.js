/**
 * Created with IntelliJ IDEA.
 * User: GXReiser
 * Date: 11/22/13
 * Time: 8:03 PM
 * To change this template use File | Settings | File Templates.
 */


$(document).ready(function(){
   $("form").submit(function(event){
       event.preventDefault();
       var username = $("#form-u").val();
       var password = base64.encode($("#form-p").val());
       $.ajax({
           headers: { user: username, pass: password },
           url:'/users/authenticate',
           method: 'post',
           success: function(data){
                console.log(data);
                if(data.success){
                    App.settings.user = {};
                    App.settings.user.username = data.user.username;
                    App.settings.user.email = data.user.email;
                    App.settings.user.hash = md5(data.user.email);
                    App.settings.user.enc_pass = base64.encode(encodeURIComponent($("#form-p").val()));
                    CookieUtil.write("sec", JSON.stringify(App.settings.user), null, '/', null);
                    window.location = "/";
                } else {
                    $(".alert").fadeIn(function(){
                        setTimeout(function(){$(".alert").fadeOut();}, 3000);
                    });
                    $("#error").html(data.errors.message);
                }

           },
           error: function(err){
               $(".alert").fadeIn(function(){
                   setTimeout(function(){$(".alert").fadeOut();}, 3000);
               });
                $("#error").html(err.message);
           }
       });

   })
});