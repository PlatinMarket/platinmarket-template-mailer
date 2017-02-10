<div class="container edit-create">
	<h3 class="page-header">
		<span>{{currentTemplate.name}}</span> 
		<small>{{currentTemplate.description}}</small>
		<button type="button" class="btn btn-success pull-right" onclick="submit()">Şablonu Kaydet</button>
		<div class="clearfix"></div>
	</h3>
	<div class="alert alert-danger" style="display: none;"></div>
	<div class="row">
		<div class="col-lg-6">
			<p class="lead">Şablon bilgileri</p>
			<div class="panel panel-default">
				<div class="panel-body">
					{{#if currentTemplate.id}}
					<input type="hidden" name="template_name" value="{{currentTemplate.name}}" />
					<input type="hidden" name="template_id" value="{{currentTemplate.id}}" />
					{{else}}
					<div class="form-group">
						<label for="template_name">Şablon adı</label>
						<input type="text" name="template_name" id="template_name" class="form-control" value="" />
					</div>
					{{/if}}
					<div class="form-group">
						<label for="template_description">Kısa açıklama</label>
						<input type="text" name="template_description" id="template_description" class="form-control" value="{{currentTemplate.description}}" />
					</div>
					<div class="form-group">
						<label for="new_department">Aktif departmanlar</label>
						<div class="input-group">
							<input type="text" value="" placeholder="Departman yazınız" name="new_department" id="new_department" class="form-control"/>
							<span class="input-group-btn">
								<button type="button" class="btn btn-primary" onclick="addDepartment()">Ekle</button>
							</span>
						</div>
						<input type="hidden" value="{{currentTemplate.department}}" name="template_department" />
						<div class="departments"></div>
					</div>
					<div class="form-group">
						<label for="tamplate_header">Varsayılan e-posta konusu</label>
						<input name="tamplate_header" id="tamplate_header" class="form-control" value="{{currentTemplate.subject}}" />
					</div>
					<div class="form-group">
						<label for="template_html">Html içerik</label>
						<textarea name="template_html" id="template_html" class="form-control" rows="8">{{currentTemplate.html}}</textarea>
					</div>
					<div class="form-group">
						<div class="checkbox">
							<label>
								<input type="checkbox" name="template_textFallback" /> Text versiyonu var
							</label>
						</div>
					</div>
					<div class="text_fallback form-group" style="display: none">
						<label for="template_text">Text içerik</label>
						<textarea name="template_text" id="template_text" class="form-control" rows="9">{{currentTemplate.text}}</textarea>
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<p class="lead new_parameter">Yeni parametre ekle</p>
			<p class="lead edit_parameter" style="display: none;">Parametre düzenle</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<input type="hidden" name="p_name" value="" />
					<div class="form-group">
						<label for="p_title">Parametre adı (label)</label>
						<input type="text" name="p_title" id="p_title" class="form-control" data-slug-target="[name='p_name_show']" data-default-value="" />
					</div>
					<div class="p_name_zone form-group">
						<label for="p_name_show">Eleman adı</label>
						<input type="text" name="p_name_show" id="p_name_show" class="form-control" />
					</div>
					<div class="form-group">
						<label for="p_type">Eleman tipi</label>
						<select name="p_type" id="p_type" class="form-control" data-default-value="string">
							<option value="string">String</option>
							<option value="boolean">Boolean</option>
						</select>
					</div>
					<div class="form-group">
						<div class="checkbox">
							<label>
								<input type="checkbox" name="p_require" data-default-value="1" /> Zorunlu alan
							</label>
						</div>
					</div>
					<div class="form-group">
						<label for="p_default">Varsayılan değer</label>
						<input type="text" name="p_default" id="p_default" class="form-control" data-default-value="" />
					</div>
					<hr/>
					<div class="text-right">
						<button type="button" name="cancel_parameter" class="btn btn-link" style="display: none;">İptal</button>
						<button type="button" name="add_parameter" class="btn btn-primary">Kaydet</button>
					</div>
				</div>
			</div>
			<p class="lead">Parametreler</p>
			<div class="panel panel-default">
				<ul class="parameters list-group">
					{{#each currentTemplate.parameter}}
						<li class="parameter list-group-item" data-name="{{name}}">
							<input type="hidden" name="name" value="{{name}}" />
							<input type="hidden" name="title" value="{{title}}" />
							<input type="hidden" name="type" value="{{type}}" />
							{{#if require}}
								<input type="hidden" name="require" value="1" />
							{{else}}
								<input type="hidden" name="require" value="0" />
							{{/if}}
							<input type="hidden" name="default" value="{{default}}" />
							<div class="pull-left">
								<h4 class="list-group-item-heading" data-bind="title">{{title}}</h4>
								<p class="list-group-item-text">
									<span class="label label-default" data-bind="name">{{name}}</span>
									<span class="label label-info" data-bind="type">{{type}}</span>
									<span class="label label-danger" data-bind="require">{{require}}</span>
									<span class="label label-primary" data-bind="default">{{default}}</span>
								</p>
							</div>
							<div class="pull-right btn-group btn-group-sm">
								<button type="button" name="edit_parameter" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-pencil"></span></button>
								<button type="button" name="delete_parameter" class="btn btn-default"><span class="glyphicon glyphicon-trash"></span></button>
							</div>
							<div class="clearfix"></div>
						</li>
					{{/each}}
				</ul>
			</div>		
		</div>
	</div>
</div>

<script id="template-parameter-item" type="text/x-handlebars-template">
    <li class="parameter list-group-item" data-name="\{{name}}">
        <input type="hidden" name="name" value="\{{name}}" />
        <input type="hidden" name="title" value="\{{title}}" />
        <input type="hidden" name="type" value="\{{type}}" />
        \{{#if require}}
        <input type="hidden" name="require" value="1" />
        \{{else}}
        <input type="hidden" name="require" value="0" />
        \{{/if}}
        <input type="hidden" name="default" value="\{{default}}" />
		<div class="pull-left">
			<h4 class="list-group-item-heading" data-bind="title">\{{title}}</h4>
			<p class="list-group-item-text">
				<span class="label label-default" data-bind="name">\{{name}}</span>
				<span class="label label-info" data-bind="type">\{{type}}</span>
				<span class="label label-danger" data-bind="require">\{{require}}</span>
				<span class="label label-primary" data-bind="default">\{{default}}</span>
			</p>
		</div>
		<div class="pull-right btn-group btn-group-sm">
			<button type="button" name="edit_parameter" class="btn btn-sm btn-default"><span class="glyphicon glyphicon-pencil"></span></button>
			<button type="button" name="delete_parameter" class="btn btn-default"><span class="glyphicon glyphicon-trash"></span></button>
		</div>
		<div class="clearfix"></div>
    </li>
</script>

<script id="template-department-item" type="text/x-handlebars-template">
    \{{#each departments}}
        <div class="label label-primary">\{{this}} <div class="label-close" onclick="removeDepartment('\{{this}}');"><span class="glyphicon glyphicon-remove"></span></div></div>
    \{{/each}}
</script>
<script src="/assets/speakingurl/speakingurl.min.js"></script>
<script>
    /*
    Remove Department
     */
    function removeDepartment(department) {
        var departments = $("input[name='template_department']").val().toString().trim();
        departments = departments ? departments.split(',') : [];
        var index = departments.indexOf(department);
        if (index == -1) return;
        departments.splice(index, 1);
        $("input[name='template_department']").val(departments.join(','));
        $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    /*
    Add Department
     */
    function addDepartment() {
        var department = $("input[name='new_department']").val().toString().trim();
        if (!department) return;
        var departments = $("input[name='template_department']").val().toString().trim();
        departments = departments ? departments.split(',') : [];
        if (departments.indexOf(department) > -1) return;
        $("input[name='new_department']").val('');
        departments.push(department);
        $("input[name='template_department']").val(departments.join(','));
        $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    // Render Departments
    var departments = $("input[name='template_department']").val().toString().trim() ? $("input[name='template_department']").val().toString().trim().split(",") : [];
    $(".departments").html(Handlebars.compile($("#template-department-item").html())({ departments }));

    // Text fallback
    {{#if currentTemplate.textFallback}}
        $("input[name='template_textFallback']")[0].checked = true;
    {{/if}}
    $("input[name='template_textFallback']").on('change', (e) => {
      $("div.text_fallback")[e.target.checked ? 'show' : 'hide']();
    }).trigger('change');

    // Parameters

    // Refresh Parameter listeners
    function refreshListeners() {
      $("input[data-slug-target]").each(function(){
        $(this).off('change').off('keyup').on('change keyup', (e) => {
            var target = $(this).attr('data-slug-target');
            $(target).val(getSlug($(this).val().trim().slice(0, 10), "_"));
        });
      });

      $("[data-show-target]").each(function(){
        $(this).off('change').on('change', (e) => {
          var target = $(this).attr('data-show-target');
          $(target)[!$(this)[0].checked ? 'show' : 'hide']();
        });
      }).trigger('change');

      $("button[name='edit_parameter']").off('click').on('click', function (e){
        e.preventDefault();
        var target = $(this).closest('.parameter');
        var parameter = {
          name: target.find("input[name='name']").val(),
          title: target.find("input[name='title']").val(),
          type: target.find("input[name='type']").val(),
          require: target.find("input[name='require']").val() == "1",
          default: target.find("input[name='default']").val()
        };
        fillForm(parameter);
      });

      $("button[name='add_parameter']").off('click').on('click', function () {
        var op = $("input[name='p_name']").val() ? "edit" : "add";
        var parameter = {
          name: $("input[name='p_name']").val() || $("input[name='p_name_show']").val(),
          title: $("input[name='p_title']").val(),
          type: $("select[name='p_type']").val(),
          require: $("input[name='p_require']")[0].checked,
          default: parseVal($("input[name='p_default']").val(), $("select[name='p_type']").val())
        };
        if (!parameter.name || !parameter.title || !parameter.type) return alert("Alanları kontrol ediniz");
        var checkVal = $(".parameter").toArray().filter(e => $(e).find("input[name='name']").val() == parameter.name).length;
        if ((op == 'add' && checkVal > 0) || (op == 'edit' && checkVal > 1)) return alert("Aynı isimde mevcut");
        if (op == "add") {
          var item = Handlebars.compile($("#template-parameter-item").html())(parameter);
          $(".parameters").append(item);
        }
        var target = $("input[name='name']").toArray().find(e => $(e).val() == parameter.name);
        if (!target) return console.error("Target not found by name " + parameter.name);
        target = $(target).closest(".parameter");
        target.find("input[name='name']").val(parameter.name);
        target.find("input[name='title']").val(parameter.title);
        target.find("input[name='type']").val(parameter.type);
        target.find("input[name='require']").val(parameter.require ? "1" : "0");
        target.find("input[name='default']").val(parameter.default);
        target.find("span[data-bind='name']").html(parameter.name);
        target.find("span[data-bind='title']").html(parameter.title);
        resetForm();
        refreshListeners();
      });


      $("button[name='cancel_parameter']").off('click').on('click', function () {
        resetForm();
      })

      $("button[name='delete_parameter']").off('click').on('click', function () {
        var target = $(this).closest(".parameter");
        var title = target.find("input[name='title']").val();
        if (!confirm(title + " adlı paramtere silinsin mi?")) return;
        target.remove();
      })
    }

    // Parse Value
    function parseVal(value, type) {
      switch (type) {
        case "boolean": return value ? "1" : "";
        case "string": return (value || null);
        default: return value.toString();
      }
    }

    // Reset Parameter form
    function resetForm(){
      $("input[name='p_name']").val("").trigger("change");
      $("input[name='p_name_zone']").show();
      $("[data-default-value]").each(function(){
        switch (true) {
          case ($(this).attr('type') == 'checkbox'):
            $(this)[0].checked = ($(this).attr('data-default-value') === '1');
            break;
          default:
            $(this).val($(this).attr('data-default-value'));
            break;
        }
        $(this).trigger('change');
      });
      $(".p_name_zone").show();
      $(".new_parameter").show();
      $(".edit_parameter").hide();
      $("button[name='cancel_parameter']").hide();
    }

    // Fill form by parameter
    function fillForm(parameter){
      $("input[name='p_title']").val(parameter.title).trigger("change");
      $("input[name='p_name']").val(parameter.name).trigger("change");
      $(".p_name_zone").hide();
      $("select[name='p_type']").val(parameter.type).trigger("change");
      $("input[name='p_require']")[0].checked = parameter.require;
      $("input[name='p_default']").val(parameter.default).trigger("change");
      $("input[name='p_require']").trigger("change");
      $(".new_parameter").hide();
      $(".edit_parameter").show();
      $("button[name='cancel_parameter']").show();
    }

    refreshListeners();
    resetForm();

    function submit() {
      var id = $("input[name='template_id']").val();
      var template = {
        name: $("input[name='template_name']").val(),
        description: $("input[name='template_description']").val(),
        department: $("input[name='template_department']").val() ? $("input[name='template_department']").val().split(",") : [],
        html: $("textarea[name='template_html']").val(),
        textFallback: $("input[name='template_textFallback']")[0].checked
      };
      if (template.textFallback) template['text'] = $("textarea[name='template_text']").val();
      template.parameter = $(".parameters .parameter").toArray().map(p => {
        return {
          name: $(p).find("input[name='name']").val(),
          title: $(p).find("input[name='title']").val(),
          type: $(p).find("input[name='type']").val(),
          require: $(p).find("input[name='require']").val() == "1",
          default: $(p).find("input[name='default']").val()
        };
      });
      $("input, button, select, textarea").attr("disabled", "disabled");
      $.post('/template' + (!id ? '/create' : '/' + id + '/edit'), template)
        .then(r => {
          if (!id) return window.location = "/template/" + r.id.toString() + "/edit";
          $("input, button, select, textarea").removeAttr("disabled");
          $(".alert").removeClass('alert-danger').addClass('alert-success').show().html("Kaydedildi");
          setTimeout(() => $(".alert").hide(), 2000);

        })
        .catch(err => {
          $("input, button, select, textarea").removeAttr("disabled");
          $(".alert").removeClass('alert-success').addClass('alert-danger').show().html(err.responseJSON ? err.responseJSON.message : err.responseText);
          console.error(err.responseJSON || err.responseText || err);
        });
    }
</script>