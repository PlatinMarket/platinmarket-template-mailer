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
					<input type="text" name="subject" class="form-control" value="" placeholder="E-posta konusu" readonly />
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
            {{#if currentTemplate.textFallback}}
                <div class="btn-group pull-right type_changer" data-toggle="buttons" style="margin-bottom: 10px;">
                    <label class="btn btn-info btn-sm active">
                        <input type="radio" name="options" id="option1" autocomplete="off" value="html" checked> Html
                    </label>
                    <label class="btn btn-info btn-sm">
                        <input type="radio" name="options" id="option2" autocomplete="off" value="text"> Text
                    </label>
                </div>
                <div class="clearfix"></div>
            {{/if}}
			<div class="panel panel-default">
				<div class="embed-responsive embed-responsive-4by3">
				  <iframe class="embed-responsive-item" name="preview"></iframe>
                  {{#if currentTemplate.textFallback}}
                    <textarea readonly name="preview_text" style="display: none;"></textarea>
                  {{/if}}
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	// Before Load
	$("form[name='render_form']").on("submit", function (e) {
	  e.preventDefault();
	  try {
        $("iframe[name='preview']").contents().find("html").html("");
        $("input[name='subject']").val("");
        $("textarea[name='preview_text']").val("");
        $("form[name='render_form']").find("button").attr("disabled", "disabled");
        $("body").addClass("preview_loading");

        var params = {};
        $(e.target).serializeArray().forEach(p => params[p.name] = p.value);
        $.post('/template/{{currentTemplate.name}}/render', params).then(result => {
          $("iframe[name='preview']").contents().find("html").html(result.html);
          $("input[name='subject']").val(result.subject);
          if (result.text) $("textarea[name='preview_text']").val(result.text);

          setTimeout(() => {
            $("form[name='render_form']").find("button").removeAttr("disabled");
            $("body").removeClass("preview_loading");
          }, 200);
        });
      } catch (err) {
	    console.error(err);
      }
    });

    $("form[name='render_form']").trigger("submit");

    $(".type_changer").on("change", function (e) {
      var type = e.target.value;
      $("iframe[name='preview']")[type == 'text' ? 'hide' : 'show']();
      $("textarea[name='preview_text']")[type == 'html' ? 'hide' : 'show']();
    });
</script>