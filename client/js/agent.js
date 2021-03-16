console.log(localStorage.getItem("agent_logged_in"))
if(!localStorage.getItem("agent_logged_in")){
    window.location.href = "/";
}
var dept_json = {"1":"Billing","2":"Sales","3":"Support"};
var ppin = localStorage.getItem("ppin");

$.each(dept_json, function(i, value) {
        $('#checkbox_dpt').append('<div><input name="dept_name" id="'+i+'" class="icheck dept_chkbox" type="checkbox" checked value="'+ppin+''+i+'"/><label class="control-label" style="margin-left:10px;" for="'+i+'">'+value +'</label></div>');
});


$('.icheck').iCheck({
    checkboxClass: 'icheckbox_minimal',
    radioClass: 'iradio_minimal',
});

$("#call_options_agent").on("click",function () {

    if($('.dept_chkbox:checkbox:checked').length)
    {
        var list = [];
        $('input:checkbox.dept_chkbox').each(function () {
            if(this.checked)
            {
                list.push(parseInt($(this).val()));
            }

        });

        localStorage.setItem("chosed_depts",list);
        localStorage.setItem("mic", $("#mic option:selected").attr('id'));
        localStorage.setItem("cam", $("#cam option:selected").attr('id'));
        window.location.href = "/session/";
    }
    else {
        toastr.error("Please choose atleast one department","",{ positionClass : "toast-top-center"});
    }



});
