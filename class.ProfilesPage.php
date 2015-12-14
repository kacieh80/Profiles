<?php
require_once('class.FlipPage.php');
require_once('class.FlipSession.php');
class ProfilesPage extends FlipPage
{
    public $profiles_root;

    function __construct($title)
    {
        parent::__construct($title, true);
        $root = $_SERVER['DOCUMENT_ROOT'];
        $script_dir = dirname(__FILE__);
        if(strstr($script_dir, $root) === false)
        {
            $this->profiles_root = dirname($_SERVER['SCRIPT_NAME']);
        }
        else
        {
            $this->profiles_root = substr($script_dir, strlen($root));
        }
        $this->add_profiles_css();
        $this->add_profiles_script();
        $this->add_login_form();
        $this->body_tags='data-login-url="'.$this->profiles_root.'/api/v1/login"';
    }

    function add_profiles_css()
    {
        $this->add_css_from_src($this->profiles_root.'/css/profiles.css');
    }

    function add_profiles_script()
    {
        $this->add_js(JS_LOGIN);
    }

    function add_links()
    {
        if($this->user !== false && $this->user !== null)
        {
            if($this->user->isInGroupNamed('LDAPAdmins'))
            {
                $this->add_link('Admin', $this->profiles_root.'/_admin/index.php');
            }
            if(($this->user->isInGroupNamed('Leads') || $this->user->isInGroupNamed('CC')))
            {
                $this->add_link('Leads', $this->profiles_root.'/lead/index.php');
            }
            $this->add_link('My Profile', $this->profiles_root.'/profile.php');
        }
    }
}
?>
