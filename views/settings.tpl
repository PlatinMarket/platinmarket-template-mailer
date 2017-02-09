<h3>Gönderim ayarları</h3>
<form name="smtp">
    <div class="alert alert-danger" style="display: none;"></div>
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
    <input type="password" name="auth_pass" value="{{user.smtp.auth.pass}}" />
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
                $.post('/settings/smtp', smtp)
                  .then(r => {
                    $(e.target).trigger('ended.submit');
                    $(e.target).find(".alert").removeClass('alert-danger').addClass('alert-success').show().html("Kaydedildi");
                    setTimeout(() => $(e.target).find(".alert").hide(), 2000);
                  })
                  .catch(err => {
                    $(e.target).trigger('ended.submit');
                    $(e.target).find(".alert").show().html(err.responseJSON ? err.responseJSON.message : err.responseText);
                    console.error(err.responseJSON || err.responseText || err);
                  });

            } catch (err) {
                $(e.target).trigger('ended.submit');
                $(e.target).find(".alert").show().html(err.message);
                console.error(err);
            }
        })
        .on('started.submit', (e) => {
            $(e.target).find("input, button").attr('disabled', 'disabled');
        })
        .on('ended.submit', (e) => {
            $(e.target).find("input, button").removeAttr('disabled');
        });

    if ({{user.smtp.secure}}) $("form[name='smtp']").find("[name='secure']")[0].checked = true;
</script>