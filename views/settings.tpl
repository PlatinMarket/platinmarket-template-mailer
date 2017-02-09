<div class="container">
	<p class="lead">Gönderim ayarları</p>	
	<div class="row">
		<div class="col-lg-6 col-md-6 col-sm-12">
			<div class="panel panel-default">
				<div class="panel-body">
					<form name="smtp" class="form-horizontal">
						<div class="alert alert-danger" style="display: none;"></div>
						<div class="form-group">
							<label for="auth_user" class="col-lg-3 col-md-4 col-sm-2 control-label">Kullanıcı adı</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="email" name="auth_user" id="auth_user" class="form-control" value="{{user.smtp.auth.user}}" />
							</div>		
						</div>		
						<div class="form-group">
							<label for="auth_pass" class="col-lg-3 col-md-4 col-sm-2 control-label">Şifre</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="password" name="auth_pass" id="auth_pass" class="form-control" value="{{user.smtp.auth.pass}}" />
							</div>				
						</div>				
						<div class="form-group">
							<label for="host" class="col-lg-3 col-md-4 col-sm-2 control-label">Host</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="text" name="host" id="host" class="form-control" value="{{user.smtp.host}}" />
							</div>
						</div>
						<div class="form-group">
							<label for="port" class="col-lg-3 col-md-4 col-sm-2 control-label">Port</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="text" name="port" id="port" class="form-control" value="{{user.smtp.port}}" />
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-offset-3 col-lg-9 col-md-offset-4 col-md-8 col-sm-offset-2 col-sm-10">
								<div class="checkbox">
									<label>
										<input type="checkbox" name="secure" /> Use TLS
									</label>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-xs-12 col-lg-3 col-lg-offset-3 col-md-3 col-md-offset-4 col-sm-2 col-sm-offset-2">
								<button type="submit" class="btn btn-block btn-success">Kaydet</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-6 col-md-6 hidden-sm hidden-xs">
			<div class="jumbotron" style="background-color:#f8f8f8;">
				<p>Bilgilendirme</p>
				<div>Bu alanda kaydedilecek e-posta hesap bilgileri, düzgün bir şekilde e-posta göndermenizi sağlayacaktır. Lütfen doğru bilgileri yazdığınızdan emin olunuz.</div>
			</div>
		</div>
	</div>
</div>
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