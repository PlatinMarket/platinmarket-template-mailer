<div class="container">
	<div class="row">
		<div class="col-xs-12 col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">
			<div class="panel panel-default">
				<div class="panel-body">
					<p class="lead text-center">
						<span class="label label-default">T</span> - 
						<span class="label label-primary">Ma</span>
						<span class="label label-info">R</span>
						<span class="label label-success">S</span>
					</p>
					<p class="alert alert-danger" style="display: none;"></p>
					<form autocomplete="off">
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
	<p class="text-center"><b>T</b>emplate <b class="text-primary">Ma</b>nage , <b class="text-info">R</b>ender , <b class="text-succcess">S</b>end<br/>platform by PlatinBOX</p>
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
            $(".alert").show().html(e.responseJSON ? e.responseJSON.message : e.responseText);
            console.error(e.responseJSON || e.responseText || e);
        })
        .on('success.log.in', function(e) {
            localStorage.setItem('lastEmail', $("input[name='email']").val());
            window.location = '/';
        });
</script>