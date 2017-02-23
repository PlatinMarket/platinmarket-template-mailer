<div class="container">
	<h3 class="page-header">Ayarlar</h3>
	<div class="row">
		<div class="col-lg-7 col-md-7 col-sm-12">	
			<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
				<div class="panel panel-default">
					<div class="panel-heading" role="tab" id="smtp_heading">
					  <h4 class="panel-title">
						<a role="button" data-toggle="collapse" data-parent="#accordion" href="#smtp_settings" aria-expanded="true" aria-controls="smtp_settings">
						  SMTP ayarları
						</a>
					  </h4>
					</div>
					<div id="smtp_settings" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="smtp_heading">
						<div class="panel-body">
							<form name="smtp" class="form-horizontal">
								<div class="form-group">
									<label for="auth_user" class="col-lg-3 col-md-4 col-sm-3 control-label">Kullanıcı adı</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="email" name="auth_user" id="auth_user" class="form-control" value="{{user.smtp.auth.user}}" />
									</div>		
								</div>		
								<div class="form-group">
									<label for="auth_pass" class="col-lg-3 col-md-4 col-sm-3 control-label">Şifre</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="password" name="auth_pass" id="auth_pass" class="form-control" value="{{user.smtp.auth.pass}}" />
									</div>				
								</div>				
								<div class="form-group">
									<label for="host" class="col-lg-3 col-md-4 col-sm-3 control-label">SMPT Host</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="text" name="host" id="host" class="form-control" value="{{user.smtp.host}}" />
									</div>
								</div>
								<div class="form-group">
									<label for="port" class="col-lg-3 col-md-4 col-sm-3 control-label">SMPT Port</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="text" name="port" id="port" class="form-control" value="{{user.smtp.port}}" />
									</div>
								</div>
								<div class="form-group">
									<div class="col-lg-offset-3 col-lg-9 col-md-offset-4 col-md-8 col-sm-offset-3 col-sm-9">
										<div class="checkbox">
											<label>
												<input type="checkbox" name="secure" /> Güvenli bağlantı (TLS) kullan
											</label>
										</div>
									</div>
								</div>
								<br/>
								<div class="row">
									<div class="col-xs-12 col-lg-3 col-lg-offset-3 col-md-3 col-md-offset-4 col-sm-2 col-sm-offset-3">
										<button type="submit" class="btn btn-block btn-success">Kaydet</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading" role="tab" id="imap_heading">
					  <h4 class="panel-title">
						<a role="button" data-toggle="collapse" data-parent="#accordion" href="#imap_settings" aria-expanded="false" aria-controls="imap_settings">
						  IMAP ayarları
						</a>
					  </h4>
					</div>
					<div id="imap_settings" class="panel-collapse collapse" role="tabpanel" aria-labelledby="imap_heading">
						<div class="panel-body">
							<form name="imap" class="form-horizontal">
								<div class="form-group">
									<label for="auth_user" class="col-lg-3 col-md-4 col-sm-3 control-label">Kullanıcı adı</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="email" name="auth_user" id="auth_user" class="form-control" value="{{user.imap.auth.user}}" />
									</div>
								</div>
								<div class="form-group">
									<label for="auth_pass" class="col-lg-3 col-md-4 col-sm-3 control-label">Şifre</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="password" name="auth_pass" id="auth_pass" class="form-control" value="{{user.imap.auth.pass}}" />
									</div>
								</div>
								<div class="form-group">
									<label for="imap_host" class="col-lg-3 col-md-4 col-sm-3 control-label">IMAP Host</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="text" name="host" id="imap_host" class="form-control" value="{{user.imap.host}}" />
									</div>
								</div>
								<div class="form-group">
									<label for="imap_port" class="col-lg-3 col-md-4 col-sm-3 control-label">IMAP Port</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<input type="text" name="port" id="imap_port" class="form-control" value="{{user.imap.port}}" />
									</div>
								</div>
								<div class="form-group">
									<div class="col-lg-offset-3 col-lg-9 col-md-offset-4 col-md-8 col-sm-offset-3 col-sm-9">
										<div class="checkbox">
											<label>
												<input type="checkbox" name="secure" /> Güvenli bağlantı (TLS) kullan
											</label>
										</div>
									</div>
								</div>
								<div class="row"><hr/></div>
								<div class="form-group">
									<label for="imap_sent_folder" class="col-lg-3 col-md-4 col-sm-3 control-label">Gönderilen klasörü</label>
									<div class="col-lg-9 col-md-8 col-sm-9">
										<select name="imap_sent_folder" id="imap_sent_folder" class="form-control" value="{{user.imap.sent_folder}}"></select>
										<span class="help-block">Gönderilmiş öğeler klasörünü imap bilgileri doğru şekilde girildikten sonra seçebilrsiniz </span>
									</div>
								</div>
								<div class="row">
									<div class="col-xs-12 col-lg-3 col-lg-offset-3 col-md-3 col-md-offset-4 col-sm-2 col-sm-offset-3">
										<button type="submit" class="btn btn-block btn-success">Kaydet</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-5 col-md-5 hidden-sm hidden-xs">
			<div class="jumbotron" style="background-color:#f8f8f8;">
				<p>Bilgilendirme</p>
				<div>Bu alanda kaydedilecek e-posta hesap bilgileri, düzgün bir şekilde e-posta göndermenizi sağlayacaktır. Lütfen doğru bilgileri yazdığınızdan emin olunuz.</div>
			</div>
		</div>
	</div>
</div>
<link rel="stylesheet" type="text/css" href="/assets/bootstrap-select/dist/css/bootstrap-select.min.css" />
<script type="application/javascript" src="/assets/bootstrap-select/dist/js/bootstrap-select.min.js"></script>
<script>
	function generateData(endpoint) {
      var data = {};
      data[endpoint] = {
        host: $("form[name='" + endpoint + "']").find("[name='host']").val(),
        port: parseInt($("form[name='" + endpoint + "']").find("[name='port']").val(), 10),
        secure: $("form[name='" + endpoint + "']").find("[name='secure']")[0].checked
      };
      // Für SMTP
      if (endpoint == 'smtp') {
        data[endpoint] = Object.assign(data[endpoint] , {
          auth: {
            user: $("form[name='" + endpoint + "']").find("[name='auth_user']").val(),
            pass: $("form[name='" + endpoint + "']").find("[name='auth_pass']").val()
          }
        });
      }
      // Für IMAP
      if (endpoint == 'imap') {
        data[endpoint] = Object.assign(data[endpoint], {
          auth: {
            user: $("form[name='" + endpoint + "']").find("[name='auth_user']").val(),
            pass: $("form[name='" + endpoint + "']").find("[name='auth_pass']").val()
          },
          sent_folder: $("form[name='" + endpoint + "']").find("[name='imap_sent_folder']").val() || $("form[name='" + endpoint + "']").find("[name='imap_sent_folder']").attr("value")
        });
      }
      return data;
    }

    $("form[name='smtp'], form[name='imap']")
        .on('submit', (e) => {
          e.preventDefault();
          var endpoint = e.target.name;
          $(e.target).trigger('started.submit');
          try {
                var data = Object.assign(generateData('smtp'), generateData('imap'));
                $.post('/settings/' + endpoint, data)
                  .then(r => {
                    $(e.target).trigger('ended.submit');
                    toastr.success("Kaydedildi");
                  })
                  .catch(err => {
                    $(e.target).trigger('ended.submit');
                    toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText);
                    console.error(err.responseJSON || err.responseText || err);
                  });

            } catch (err) {
                $(e.target).trigger('ended.submit');
            	toastr.error(err.message);
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
    if ({{user.imap.secure}}) $("form[name='imap']").find("[name='secure']")[0].checked = true;

    $("form[name='imap']").find("[name='imap_sent_folder']")
	    .on('shown.bs.select', (e) => {
		    if ($(e.target).data("data")) return;
          	var selected = $("form[name='imap']").find("[name='imap_sent_folder']").attr("value");
		    $(e.target).selectpicker('toggle');
		    $(e.target).selectpicker({noneSelectedText: "Lütfen bekleyin..."}).selectpicker('refresh');
			$.post("/settings/mailboxes", Object.assign(generateData('smtp'), generateData('imap'))).then((list) => {
				$(e.target).find("option").remove();
				$(e.target).data("data", list);
              	$(e.target).append("<option value='' " + (!selected ? "selected='selected'" : "") + ">Seçiniz</option>");
				list.forEach(l => {
				  $(e.target).append("<option value='" + l + "' " + (selected == l ? "selected='selected'" : "") + ">" + l + "</option>");
				});
				$(e.target).selectpicker({noneSelectedText: "Seçiniz"}).selectpicker('refresh').selectpicker('toggle');
			}).catch(err => {
			  $(e.target).selectpicker({noneSelectedText: "Seçiniz"}).selectpicker('refresh');
			  toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText);
			  console.error(err.responseJSON || err.responseText || err);
			});
		})
		.selectpicker({
      		noneSelectedText: $("form[name='imap']").find("[name='imap_sent_folder']").attr("value") || "Seçiniz"
		});

    $("form[name='imap']").find("[name='host'], [name='port']").on("keyup", (e) => {
      var host = $("form[name='imap']").find("[name='host']").val();
      var port = $("form[name='imap']").find("[name='port']").val();
      if (!host || !port)
        $("form[name='imap']").find("[name='imap_sent_folder']").prop('disabled', true).selectpicker('refresh');
      else
        $("form[name='imap']").find("[name='imap_sent_folder']").prop('disabled', false).selectpicker('refresh');
    }).trigger('keyup');
</script>