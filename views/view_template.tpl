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
					<form action="/template/{{currentTemplate.id}}/render" method="post" target="preview" name="render_form" autocomplete="off">
						{{#each currentTemplate.parameter}}
							<div class="form-group">
								<label for="{{name}}">{{title}} {{#if require}}*{{/if}}</label>
								<input type="text" name="{{name}}" id="{{name}}" placeholder="{{default}}" class="form-control" {{#if require}}required{{/if}} />
							</div>
						{{/each}}
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-8">
			<p class="lead">E-posta</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<form class="form-horizontal" method="post" name="send-mail" autocomplete="off">
						<div class="form-group">
							<label for="to" class="col-lg-2 control-label">E-posta adresi</label>
							<div class="col-lg-10">
								<div class="input-group">
									<input type="email" name="to" id="to" class="form-control" required />
									<span class="input-group-btn">
										<input type="hidden" name="template" />
										<input type="hidden" name="params" />
										<button type="submit" class="btn btn-block btn-primary">Gönder</button>
									</span>
								</div>
							</div>
						</div>
						<div class="form-group">
							<label for="subject" class="col-lg-2 control-label">Konu</label>
							<div class="col-lg-10">
								<p id="subject" class="form-control-static" style="font-weight:bold;"></p>
							</div>
						</div>
					</form>
				</div>
			</div>
			<div class="row">
				<div class="col-lg-4">
					<div class="form-group hidden visible-lg">
						<div class="btn-group size_changer" data-toggle="buttons">
							<label class="btn btn-default active">
								<input type="radio" name="options" id="desktop" autocomplete="off" value="100%" checked />Desktop
							</label>
							<label class="btn btn-default">
								<input type="radio" name="options" id="tablet" autocomplete="off" value="768px" />Tablet
							</label>
							<label class="btn btn-default">
								<input type="radio" name="options" id="mobile" autocomplete="off" value="375px" />Mobile
							</label>
						</div>
					</div>
				</div>
				<div class="col-lg-4 text-center">
					<div class="form-group" data-zone="template-selector"></div>
				</div>
				<div class="col-lg-4 text-right">
					<div class="form-group">
						<div class="btn-group type_changer" data-toggle="buttons">
							<label class="btn btn-default active">
								<input type="radio" name="options" id="option1" autocomplete="off" value="html" checked />Html
							</label>
							<label class="btn btn-default">
								<input type="radio" name="options" id="option2" autocomplete="off" value="text" />Text
							</label>
						</div>
					</div>
				</div>
			</div>
			<div class="panel panel-default panel-embed">
				<div class="embed-responsive embed-responsive-4by3">
				  <iframe class="embed-responsive-item" name="preview"></iframe>
                  <textarea readonly name="preview_text" style="display: none;"></textarea>
				</div>
			</div>
		</div>
	</div>
</div>

<script id="template-render-selector" type="text/x-handlebars-template">
	<select id="template-selector" name="template-selector" class="form-control">
		\{{#each templates}}
		<option value="\{{folder}}">\{{name}}</option>
		\{{/each}}
	</select>
</script>

<input type="hidden" name="template_name" value="{{currentTemplate.name}}" />
{{#if currentTemplate.isGroup}}
	<input type="hidden" name="group_templates" value="{{currentTemplate.description}}" />
	<input type="hidden" name="group_template_folders" value="{{currentTemplate.templateFolders}}" />
{{else}}
	<input type="hidden" name="group_templates" value="{{currentTemplate.name}}" />
	<input type="hidden" name="group_template_folders" value="{{currentTemplate.folder}}" />
{{/if}}
<script>
	var templates = $("input[name='group_templates']").val().trim() ? $("input[name='group_templates']").val().trim().split(",") : [];
	var template_folders = $("input[name='group_template_folders']").val().trim() ? $("input[name='group_template_folders']").val().trim().split(",") : [];
	templates = templates.map(t => { return { name: t, folder: template_folders[templates.indexOf(t)] }; });
    var template = templates[0];
	var isGroup = templates.length > 1;
	var templateName = isGroup ? $("input[name='template_name']").val().trim() : $("input[name='group_template_folders']").val().trim();

    if (isGroup) {
      $("[data-zone='template-selector']").html(Handlebars.compile($("#template-render-selector").html())({templates: templates}));
      $("select[name='template-selector']").on('change', (e) => {
        template = templates.find(t => t.folder == e.target.value);
        $("form[name='render_form']").trigger("submit");
	  });
      $("select[name='template-selector']").val(template.folder);
    }

	// Before Load
	$("form[name='render_form']").on("submit", function (e) {
	  e.preventDefault();
	  try {
        $("iframe[name='preview']").contents().find("html").html("");
        $("#subject").html("");
        $("textarea[name='preview_text']").val("");
        $("form[name='render_form']").find("button").attr("disabled", "disabled");
        $("body").addClass("preview_loading");

        var params = {};
        $(e.target).serializeArray().forEach(p => params[p.name] = p.value);
        $.post('/template/' + template.folder + '/render', params).then(result => {
          $("iframe[name='preview']").contents().find("html").html(result.html);
          $("#subject").html(result.subject);
          $("textarea[name='preview_text']").val(result.text || "Text şablonu kaydedilmemiş");

          setTimeout(() => {
            $("form[name='render_form']").find("button").removeAttr("disabled");
            $("body").removeClass("preview_loading");
          }, 200);
        }).catch(err => {
          $("iframe[name='preview']").contents().find("html").html("<h3>TEMPLATE RENDER ERROR</h3><p>" + err.responseJSON.message + "</p>").find('body').css('background-color', 'white');
          $("#subject").html("Template Render Error");
          $("textarea[name='preview_text']").val("Template Render Error");
          $("form[name='render_form']").find("button").removeAttr("disabled");
          $("body").removeClass("preview_loading");
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
	
    $(".size_changer").on("change", function (e) {
      var size = e.target.value;
      $(".embed-responsive").css("width",size);
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

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    $("form[name='send-mail']").on("submit", (e) => {
      try {
        if ($("form[name='render_form']")[0].checkValidity && !$("form[name='render_form']")[0].checkValidity()) {
          toastr.error('Zorunlu parametreler boş bırakılamaz');
          return e.preventDefault();
        }
        $("input[name='template']").val(templateName);
        var params = {};
        $("form[name='render_form']").serializeArray().forEach(p => params[p.name] = p.value);
        $("input[name='params']").val(JSON.stringify(params));
      } catch (err) {
        e.preventDefault();
	    	console.error(err);
      }
	}).attr('action', '/template/send/' + guid());
</script>