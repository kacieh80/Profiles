function flagInvalid(item, message)
{
    item.data('valid', false);
    item.parents('.form-group').addClass('has-error');
    if(message !== undefined)
    {
        item.parent().append('<div class="col-sm-10">'+message+'</div>');
    }
}

function flagValid(item)
{
    item.data('valid', true);
    item.parents('.form-group').removeClass('has-error');
    item.next('div').remove();
}

function getEmailErrorMessage(json)
{
    if(json.email === undefined)
    {
        return '';
    }
    if(json.pending === true)
    {
        return 'The email address '+json.email+' is already registered, but the account is not yet active. Please check your email for a confirmation email.';
    }
    return 'The email address '+json.email+' is already used. Please go <a href="reset.php">here</a> to reset the password for that account.';
}

function getUIDErrorMessage(json)
{
    if(json.uid === undefined)
    {
        return '';
    }
    if(json.pending === true)
    {
        return 'The username '+json.uid+' is already registered, but the account is not yet active. Please check your email for a confirmation email.';
    }
    return 'The username '+json.uid+' is already used. Please go <a href="reset.php">here</a> to reset the password for that account.';
}

function email_check_done(jqXHR)
{
    if(jqXHR.status !== 200 || jqXHR.responseJSON === undefined)
    {
        flagInvalid($(this));
        return;
    }
    if(jqXHR.responseJSON === false || jqXHR.responseJSON.res === false)
    {
        var message = getEmailErrorMessage(jqXHR.responseJSON);
        flagInvalid($(this), message);
        return;
    }
    flagValid($(this));
}

function uid_check_done(jqXHR)
{
    if(jqXHR.status !== 200 || jqXHR.responseJSON === undefined)
    {
        flagInvalid($(this));
        return;
    }
    if(jqXHR.responseJSON === false || jqXHR.responseJSON.res === false)
    {
        var message = getUIDErrorMessage(jqXHR.responseJSON);
        flagInvalid($(this), message);
        return;
    }
    flagValid($(this));
}

function check_email(e)
{
    var control = e.target;
    if(e.target.willValidate !== true)
    {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if(re.test(email) === false)
        {
            $(control).data('valid', false);
            $(control).parents('.form-group').addClass('has-error');
            return;
        }
    }
    $.ajax({
        url: 'api/v1/users/Actions/check_email_available',
        data: 'email='+encodeURIComponent(control.value),
        type: 'POST',
        dataType: 'json',
        context: control,
        complete: email_check_done
    });
}

function check_uid(e)
{
    var control = e.target;
    if(control.value.indexOf(',') > -1)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    if(control.value.indexOf('=') > -1)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    $.ajax({
        url: 'api/v1/users/Actions/check_uid_available',
        data: 'uid='+encodeURIComponent(control.value),
        type: 'POST',
        dataType: 'json',
        context: control,
        complete: uid_check_done
    });
}

function check_pass(e)
{
    var control = e.target;
    var value = control.value;
    if(value.length < 4)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    if(/[a-z]/.test(value) === false)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    if(/[A-Z]/.test(value) === false)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    if(/[0-9]/.test(value) === false)
    {
        $(control).data('valid', false);
        $(control).parents('.form-group').addClass('has-error');
        return;
    }
    $(control).data('valid', true);
    $(control).parents('.form-group').removeClass('has-error');
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

function form_submit_done(jqXHR)
{
    console.log(jqXHR);
    if(jqXHR.status === 200)
    {
        if(jqXHR.responseJSON === undefined || jqXHR.responseJSON.message === undefined)
        {
            window.location.replace('thanks.php');
        }
        else
        {
            alert(jqXHR.responseJSON.message);
        }
    }
    else
    {
        alert(jqXHR.responseJSON);
        console.log(jqXHR);
    }
}

function submit_registration_form(form)
{
    var obj = form.serializeObject();
    $.ajax({
        url: '/api/v1/users',
        data: JSON.stringify(obj),
        type: 'POST',
        dataType: 'json',
        processData: false,
        complete: form_submit_done});
}

function validate_fields(index, value)
{
    if($(value).val().length === 0)
    {
        $(value).parents('.form-group').addClass('has-error');
        $(value).parents('.form-group').removeClass('has-success');
    }
    else if(value.willValidate === true && value.checkValidity() === false)
    {
        $(value).parents('.form-group').addClass('has-error');
        $(value).parents('.form-group').removeClass('has-success');
    }
    else if($(value).data('valid') === false)
    {
        $(value).parents('.form-group').addClass('has-error');
        $(value).parents('.form-group').removeClass('has-success');
    }
    else
    {
        $(value).parents('.form-group').removeClass('has-error');
        $(value).parents('.form-group').addClass('has-success');
    }
}

function submit_click(e)
{
    var required_fields = $('#form [required]');
    $.each(required_fields, validate_fields);
    var pass  = $('#password').val();
    var pass2 = $('#password2').val();
    if(pass !== pass2)
    {
        $('#password2').parents('.form-group').addClass('has-error');
        $('#password2').parents('.form-group').removeClass('has-success');
    }
    else
    {
        $('#password2').parents('.form-group').removeClass('has-error');
        $('#password2').parents('.form-group').addClass('has-success');
    }
    if($('#form .form-group.has-error').length === 0)
    {
        submit_registration_form($('#form'));
    }
    e.preventDefault();
    return false;
}

function init_register_page()
{
    $('[title]').tooltip();
    original_tooltip = $("#password").attr('data-original-title');
    $('#email').on('change', check_email);
    $('#uid').on('change', check_uid);
    $('#password').on('change', check_pass);
    $('#submit').on('click', submit_click);
}

$(init_register_page);
