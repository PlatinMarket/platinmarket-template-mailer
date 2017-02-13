<div class="container">
	<h3 class="page-header">
		{{currentTemplate.name}} <small>{{currentTemplate.description}}</small>
		{{#if user.isSuper}}
        	{{#unless currentTemplate.isGroup}}
				<a class="btn btn-default pull-right" href="/template/{{currentTemplate.id}}/edit">Şablonu düzenle</a>
        	{{/unless}}
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
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-8">
			<p class="lead">E-posta</p>
			<div data-zone="template-selector"></div>
			<div class="panel panel-default">
				<div class="panel-body">
					<form class="form-horizontal">
						<div class="form-group">
							<label for="subject" class="col-lg-2 control-label">Konu</label>
							<div class="col-lg-10">
								<input type="text" name="subject" id="subject" class="form-control" value="" readonly />
							</div>
						</div>
						<div class="form-group">
							<label for="email" class="col-lg-2 control-label">E-posta adresi</label>
							<div class="col-lg-10">
								<div class="input-group">
									<input type="email" name="email" id="email" class="form-control" required />
									<span class="input-group-btn">
										<button type="submit" class="btn btn-block btn-primary">Gönder</button>
									</span>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-8">
			<div class="panel panel-default">
				<div class="embed-responsive embed-responsive-4by3">
				  <iframe class="embed-responsive-item" name="preview"></iframe>
                  <textarea readonly name="preview_text" style="display: none;"></textarea>
				</div>
			</div>

			<div class="form-group">
                <div class="btn-group pull-right type_changer" data-toggle="buttons">
                    <label class="btn btn-default btn-sm active">
                        <input type="radio" name="options" id="option1" autocomplete="off" value="html" checked>Html
                    </label>
                    <label class="btn btn-default btn-sm">
                        <input type="radio" name="options" id="option2" autocomplete="off" value="text">Text
                    </label>
                </div>
                <div class="clearfix"></div>
			</div>

		</div>
	</div>
</div>

<script id="template-render-selector" type="text/x-handlebars-template">
	<select name="template-selector">
		\{{#each templates}}
		<option>\{{this}}</option>
        \{{/each}}
	</select>
</script>

{{#if currentTemplate.isGroup}}
	<input type="hidden" name="group_templates" value="{{currentTemplate.description}}" />
{{else}}
	<input type="hidden" name="group_templates" value="{{currentTemplate.name}}" />
{{/if}}
<script>
	var templates = $("input[name='group_templates']").val().trim() ? $("input[name='group_templates']").val().trim().split(",") : [];
    var template = templates[0];
	var isGroup = templates.length > 1;

    if (isGroup) {
      $("[data-zone='template-selector']").html(Handlebars.compile($("#template-render-selector").html())({templates: templates}));
      $("select[name='template-selector']").on('change', (e) => {
        template = e.target.value;
        $("form[name='render_form']").trigger("submit");
	  });
      $("select[name='template-selector']").val(template);
    }

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
        $.post('/template/' + template + '/render', params).then(result => {
          $("iframe[name='preview']").contents().find("html").html(result.html);
          $("input[name='subject']").val(result.subject);
          $("textarea[name='preview_text']").val(result.text || "Text şablonu kaydedilmemiş");

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

    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    $("form[name='render_form']").find("input").off("keyup").on("keyup", (e) => {
      delay(function(){
        $("form[name='render_form']").trigger("submit");
      }, 500 );
	});
</script>