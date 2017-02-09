<h3>Gönderim ayarları</h3>
<form name="smtp">
    <label>Host:</label>
    <input type="text" name="host" value="{{user.smtp.host}}" />
    <br>
    <label>Port:</label>
    <input type="text" name="port" value="{{user.smtp.port}}" />
    <br>
    <label><input type="checkbox" name="secure" /> Use TLS</label>
    <br>
    <label>Kullanıcı adı</label>
    <input type="text" name="auth_user" value="{{user.smtp.auth.user}}" />
    <br>
    <label>Şifre</label>
    <input type="text" name="auth_pass" value="{{user.smtp.auth.pass}}" />
    <button type="submit">Kaydet</button>
</form>

<script>
    $("form[name='smtp']")
        .on('submit', (e) => {
          e.preventDefault();
          $(e.target).trigger('started.submit');
          try {
                var smtp = {
                    host: $(e.target).find("[name='host']").val(),
                    port: parseInt($(e.target).find("[name='port']").val(), 10),
                    secure: $(e.target).find("[name='secure']")[0].checked,
                    auth: {
                        user: $(e.target).find("[name='auth_user']").val(),
                        pass: $(e.target).find("[name='auth_pass']").val()
                    }
                };
                console.log(smtp);

            } catch (err) {
                console.error(err);
            }
        })
        .on('started.submit', (e) => {
            $(e.target).find("input, button").attr('disabled', 'disabled');
        })
        .on('ended.submit', (e) => {
            $(e.target).find("input, button").removeAttr('disabled');
        });
</script>