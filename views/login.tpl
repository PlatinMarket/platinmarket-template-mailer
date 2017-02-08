<div class="container margin-top">
	<div class="row">
		<div class="col-xs-12 col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
			<div class="panel panel-default">
				<div class="panel-body">
					<p class="lead text-center">PlatinBOX E-mails</p>
					<p class="alert alert-danger" style="display: none;"></p>
					<form>
						<div class="form-group">
							<input type="email" name="email" class="form-control" placeholder="E-posta" required />
						</div>			
						<div class="form-group">
							<input type="password" name="password" class="form-control" placeholder="Şifre" required />
						</div>
						<button type="submit" class="btn btn-block btn-success">Oturum aç</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
<script type="application/javascript" src="/assets/jquery/dist/jquery.min.js"></script>
<script>
    $("input[name='email']").val(localStorage.getItem('lastEmail') || "");
    $("form")
        .on('submit', function(e) {
            e.preventDefault();
            $(e.target).trigger('log.in');
            $.post('/login', {email: $("input[name='email']").val(), password: $("input[name='password']").val()})
                .then(r => $(e.target).trigger('success.log.in'))
                .catch(err => $(e.target).trigger($.Event('error.log.in', err)));
        })
        .on('log.in', function(e) {
            $(this).find('input, button').attr('disabled', 'disabled');
        })
        .on('error.log.in', function(e) {
            $(this).find('input, button').removeAttr('disabled');
            $(".alert").show().html(e.responseText);
        })
        .on('success.log.in', function(e) {
            $(".alert").show().html("Giriş başarılı");
            localStorage.setItem('lastEmail', $("input[name='email']").val());
            window.location = '/';
        });
</script>