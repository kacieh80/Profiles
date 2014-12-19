function validate_email(value, element, params)
{
    if(this.optional(element))
    {
        return true;
    }
    if((value.indexOf('+') > -1) && (value.indexOf('+') < value.indexOf('@')))
    {
        var is_valid = false;
        var begin = value.substring(0, value.indexOf('+'));
        var end = value.substring(value.indexOf('@'));
        $.ajax({
            url: '/ajax/valid_email.php',
            data: 'email='+begin+end,
            type: 'get',
            dataType: 'json',
            async: false,
            success: function(data){is_valid = data;}});
        return is_valid;
    }
    else
    {
        return true;
    }
}

function validate_pass_len(value, element, params)
{
    if(value.length < 4)
    {
        return false;
    }
    return true;
}

function validate_pass_lower(value, element, params)
{
    return (/[a-z]/.test(value));
}

function validate_pass_upper(value, element, params)
{
    return (/[A-Z]/.test(value));
}

function validate_pass_number(value, element, params)
{
    return (/[0-9]/.test(value));
}

var original_tooltip = null;

function validate_complexity(value, element, params)
{
    if(this.optional(element))
    {
        return true;
    }
    var password = value;
    var email = $('#email').val();
    var uid = $('#uid').val();
    var res = zxcvbn(password, [email, uid]);
    var msg;
    switch(res.score)
    {
       case 0:
           msg = "Incredibly weak password";
           break;
       case 1:
           msg = "Weak password";
           break;
       case 2:
           msg = "Average password";
           break;
       case 3:
           msg = "Strong password";
           break;
       case 4:
           msg = "Very strong password";
           break;
    }
    $("#password").attr('title', msg+". Estimated password crack time is "+res.crack_time+"s");
    $("#password").attr('data-original-title', original_tooltip+'\n'+msg+". Estimated password crack time is "+res.crack_time+"s");
    return true;
}

function validate_uid(value, element, params)
{
    if(this.optional(element))
    {
        return true;
    }
    if(value.indexOf(',') > -1)
    {
        return false;
    }
    if(value.indexOf('=') > -1)
    {
        return false;
    }
    return true;
}

function validate_pass2(value, element, params)
{
    var pass2 = value;
    var pass  = $('#password').val();
    if(pass2 === pass)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function form_submit_done(data, textStatus, jqXHR)
{
    if(data.error === undefined)
    {
        window.location.replace('thanks.php');
    }
    else
    {
        alert(data.error);
        console.log(data);
    }
}

function submit_registration_form(form)
{
    $.ajax({
        url: '/ajax/register.php',
        data: $(form).serialize(),
        type: 'post',
        dataType: 'json',
        success: form_submit_done});
}

function invalid_registration_form(event, validator)
{
    if(validator.errorList.length > 0)
    {
    }
}

function submit_click()
{
    if($('#form').valid())
    {
        submit_registration_form($('#form')[0]);
    }
}

function init_register_page()
{
    jQuery.validator.addMethod("email", validate_email, 'An equivalent + address is already registered. Are you sure you need another one?');
    jQuery.validator.addMethod("pass_length", validate_pass_len, 'Passwords must be at least 4 characters long');
    jQuery.validator.addMethod("pass_lower", validate_pass_lower, 'Passwords must contain at least one lower case letter');
    jQuery.validator.addMethod("pass_upper", validate_pass_upper, 'Passwords must contain at least one upper case letter');
    jQuery.validator.addMethod("pass_number", validate_pass_number, 'Passwords must contain at least one number');
    jQuery.validator.addMethod("pass_complex", validate_complexity, 'Password is not complex enough');
    jQuery.validator.addMethod("uid", validate_uid, 'Uesernames cannot contain , or =');
    jQuery.validator.addMethod("pass2", validate_pass2, 'Passwords are not the same');

    jQuery.validator.addClassRules("pass", {pass_length: true, pass_lower: true, pass_upper: true, pass_number: true, pass_complex:true});

    $('#form').validate({
        submitHandler: submit_registration_form,
        invalidHandler: invalid_registration_form,
        rules: { 
            email: { required: true, email: true, remote: 'ajax/valid_email.php'},
            uid: { required: true, remote: 'ajax/valid_uid.php', uid: true},
            password: { required: true },
            password2: { required: true, pass2: true }
        },
        messages: {
            email: { remote: jQuery.validator.format('Email address {0} is already registered. Please click <a href=\"/reset.php\">here</a> to request a password reset.') },
            uid: { remote: jQuery.validator.format('The username {0} is already registered. Please try another.') }
        }
    });
    
    $('[title]').tooltip();
    original_tooltip = $("#password").attr('data-original-title');
    $('#submit').on('click', submit_click);
}

$(init_register_page);
