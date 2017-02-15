<div class="container">
	<div class="row">
		<div class="col-lg-6 col-md-6 col-sm-12">
			<p class="lead">SMTP ayarları</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<form name="smtp" class="form-horizontal">
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
										<input type="checkbox" name="secure" /> Güvenli bağlantı (TLS) kullan
									</label>
								</div>
							</div>
						</div>
						<div class="row">
							<hr />
							<div class="col-xs-12 col-lg-3 col-lg-offset-3 col-md-3 col-md-offset-4 col-sm-2 col-sm-offset-2">
								<button type="submit" class="btn btn-block btn-success">Kaydet</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-6 col-md-6">
			<p class="lead">IMAP ayarları</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<form name="imap" class="form-horizontal">
						<div class="form-group">
							<label for="imap_sent_folder" class="col-lg-3 col-md-4 col-sm-2 control-label">Gönd. Klasörü</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<select name="imap_sent_folder" id="imap_sent_folder" class="form-control" value="{{user.imap.sent_folder}}"></select>
							</div>
						</div>
						<div class="form-group">
							<label for="host" class="col-lg-3 col-md-4 col-sm-2 control-label">Host</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="text" name="host" id="host" class="form-control" value="{{user.imap.host}}" />
							</div>
						</div>
						<div class="form-group">
							<label for="port" class="col-lg-3 col-md-4 col-sm-2 control-label">Port</label>
							<div class="col-lg-9 col-md-8 col-sm-10">
								<input type="text" name="port" id="port" class="form-control" value="{{user.imap.port}}" />
							</div>
						</div>
						<div class="form-group">
							<div class="col-lg-offset-3 col-lg-9 col-md-offset-4 col-md-8 col-sm-offset-2 col-sm-10">
								<div class="checkbox">
									<label>
										<input type="checkbox" name="secure" /> Güvenli bağlantı (TLS) kullan
									</label>
								</div>
							</div>
						</div>
						<div class="form-group" style="height: 35px;"></div>
						<div class="row">
							<hr />
							<div class="col-xs-12 col-lg-3 col-lg-offset-3 col-md-3 col-md-offset-4 col-sm-2 col-sm-offset-2">
								<button type="submit" class="btn btn-block btn-success">Kaydet</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
<link rel="stylesheet" type="text/css" href="/assets/bootstrap-select/dist/css/bootstrap-select.min.css" />
<script type="application/javascript" src="/assets/bootstrap-select/dist/js/bootstrap-select.min.js"></script>
<script>
	function generateData(endpoint) {
      var data = {
        host: $("form[name='" + endpoint + "']").find("[name='host']").val(),
        port: parseInt($("form[name='" + endpoint + "']").find("[name='port']").val(), 10),
        secure: $("form[name='" + endpoint + "']").find("[name='secure']")[0].checked
      };
      // Für SMTP
      if (endpoint == 'smtp') {
        data = Object.assign(data, {
          auth: {
            user: $("form[name='" + endpoint + "']").find("[name='auth_user']").val(),
            pass: $("form[name='" + endpoint + "']").find("[name='auth_pass']").val()
          }
        });
      }
      // Für IMAP
      if (endpoint == 'imap') {
        data = Object.assign(data, {
          sent_folder: $("form[name='" + endpoint + "']").find("[name='imap_sent_folder']").val()
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
                var data = generateData(endpoint);
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
			$.post("/settings/mailboxes", Object.assign({ smtp: generateData('smtp'), imap: generateData('imap') })).then((list) => {
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
</script>