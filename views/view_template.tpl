<div class="container">
	<h3 class="page-header">
		{{currentTemplate.name}} <small>{{currentTemplate.description}}</small>
		{{#if user.isSuper}}
		<a class="btn btn-default pull-right" href="/template/{{currentTemplate.id}}/edit">Şablonu düzenle</a>
		{{/if}}
		<div class="clearfix"></div>
	</h3>
	<div class="row">
		<div class="col-lg-3 col-md-4">
			<p class="lead">Parametreler</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<form action="/template/{{currentTemplate.id}}/render" method="post" target="preview" name="render_form">
						{{#each currentTemplate.parameter}}
							<div class="form-group">
								<label for="{{name}}">{{title}}</label>
								<input type="text" name="{{name}}" id="{{name}}" value="{{default}}" class="form-control" {{#if require}}required{{/if}} />
							</div>
						{{/each}}
					  	<button type="submit" class="btn btn-block btn-primary">Kaydet ve Önizle</button>
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-8">
			<p class="lead">Gönderi</p>
			<form>
				<div class="form-group">
					<input type="text" class="form-control" value="{{currentTemplate.subject}}" placeholder="E-posta konusu" required />
				</div>
				<div class="form-group">
					<div class="input-group">
						<input type="email" class="form-control" placeholder="Gönderilecek e-posta" required />
						<span class="input-group-btn">
							<button type="submit" class="btn btn-success">Gönder</button>
						</span>
					</div>
				</div>
			</form>
		</div>
		<div class="col-lg-9 col-md-8">
			<p class="lead">Önizleme</p>
			<div class="panel panel-default">
				<div class="embed-responsive embed-responsive-4by3">
				  <iframe class="embed-responsive-item" name="preview"></iframe>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	// Before Load
	$("form[name='render_form']").on("submit", function (e) {
      	$("form[name='render_form']").find("button").attr("disabled", "disabled");
  		$("body").addClass("preview_loading");
  		//e.preventDefault();
    });

    // Loaded event
	$("iframe[name='preview']").on('load', function () {
      setTimeout(() => {
        $("form").find("button").removeAttr("disabled");
        $("body").removeClass("preview_loading");
	  }, 200);
    });

    $("form[name='render_form']").trigger("submit");
</script>