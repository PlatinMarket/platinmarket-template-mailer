<div class="container edit-create">
	<h3 class="page-header">
		<span>{{currentTemplate.name}}</span>
		<small>{{currentTemplate.description}}</small>
        {{#if currentTemplate.id}}
		<button type="button" class="btn btn-link" onclick="deleteTemplate('{{currentTemplate.id}}')">Sil</button>
        {{/if}}
		<button type="button" class="btn btn-success pull-right" onclick="submit()">Kaydet</button>
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
						<label for="template_type">Şablon Tipi</label>
						<select type="text" name="template_type" id="template_type" class="form-control">
							<option value="email">E-Posta</option>
						</select>
					</div>
					<div class="form-group">
						<label for="template_description">Kısa açıklama</label>
						<input type="text" name="template_description" id="template_description" class="form-control" value="{{currentTemplate.description}}" />
					</div>
					<div class="form-group">
						<label for="new_group">Şablon grupları</label>
						<div class="input-group">
							<input type="text" value="" placeholder="Şablon grubu yazınız örn. Hoşgeldin" name="new_group" id="new_group" class="form-control" list="group_list"/>
							<datalist id="group_list"></datalist>
							<span class="input-group-btn">
								<button type="button" class="btn btn-default" onclick="addValue('group')">Ekle</button>
							</span>
						</div>
						<input type="hidden" value="{{currentTemplate.group}}" name="template_group" />
						<div class="groups tags"></div>
					</div>
					<div class="form-group">
						<label for="new_department">Aktif departmanlar</label>
						<div class="input-group">
							<input type="text" value="" placeholder="Departman yazınız" name="new_department" id="new_department" class="form-control" list="department_list"/>
							<datalist id="department_list"></datalist>
							<span class="input-group-btn">
								<button type="button" class="btn btn-default" onclick="addValue('department')">Ekle</button>
							</span>
						</div>
						<input type="hidden" value="{{currentTemplate.department}}" name="template_department" />
						<div class="departments tags"></div>
					</div>
					<div class="form-group">
						<label for="template_subject">Varsayılan e-posta konusu</label>
						<input name="template_subject" id="template_subject" class="form-control" value="{{currentTemplate.subject}}" />
					</div>
					<div class="form-group">
						<label for="template_html" class="pull-left">Html içerik</label> 
						<button class="btn btn-default btn-xs pull-right" onclick="editor.setOption('fullScreen', true); editor.setOption('lineNumbers', true);$('body').addClass('codemirror_full');"><span class="glyphicon glyphicon-fullscreen"></span></button>
						<div class="clearfix"></div>
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
							</div>
							<div class="pull-right btn-group btn-group-xs">
								<button type="button" name="edit_parameter" class="btn btn-sm btn-default">Düzenle</button>
								<button type="button" name="delete_parameter" class="btn btn-default">Sil</button>
							</div>
							<div class="clearfix"></div>
							<table class="table table-bordered table-condensed">
								<thead>
									<tr>
										<th>Eleman adı</th>
										<th>Eleman tipi</th>
										<th>Zorunlu alan</th>
										<th>Varsayılan değer</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td data-bind="name">{{name}}</td>
										<td data-bind="type">{{type}}</td>
										<td data-bind="require">{{require}}</td>
										<td data-bind="default">{{default}}</td>
									</tr>
								</tbody>
							</table>
						</li>
						{{else}}
						<li class="list-group-item empty">Henüz parametre eklenmemiş</li>
					{{/each}}
				</ul>
			</div>
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
						<button type="button" name="add_parameter" class="btn btn-default">Ekle</button>
					</div>
				</div>
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
		</div>
		<div class="pull-right btn-group btn-group-xs">
			<button type="button" name="edit_parameter" class="btn btn-sm btn-default">Düzenle</button>
			<button type="button" name="delete_parameter" class="btn btn-default">Sil</button>
		</div>
		<div class="clearfix"></div>
		<table class="table table-bordered table-condensed">
			<thead>
				<tr>
					<th>Eleman adı</th>
					<th>Eleman tipi</th>
					<th>Zorunlu alan</th>
					<th>Varsayılan değer</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td data-bind="name">\{{name}}</td>
					<td data-bind="type">\{{type}}</td>
					<td data-bind="require">\{{require}}</td>
					<td data-bind="default">\{{default}}</td>
				</tr>
			</tbody>
		</table>
    </li>
</script>

<script id="template-department-item" type="text/x-handlebars-template">
    \{{#each data}}
        <div class="label label-primary">\{{this}} <div class="label-close" onclick="removeValue('department', '\{{this}}');"><span class="glyphicon glyphicon-remove"></span></div></div>
    \{{/each}}
</script>

<script id="template-group-item" type="text/x-handlebars-template">
    \{{#each data}}
        <div class="label label-primary">\{{this}} <div class="label-close" onclick="removeValue('group', '\{{this}}');"><span class="glyphicon glyphicon-remove"></span></div></div>
    \{{/each}}
</script>
<link rel="stylesheet" type="text/css" href="/assets/codemirror/lib/codemirror.css" />
<link rel="stylesheet" type="text/css" href="/assets/codemirror/addon/display/fullscreen.css" />
<link rel="stylesheet" type="text/css" href="/assets/codemirror/addon/lint/lint.css" />
<link rel="stylesheet" type="text/css" href="/assets/codemirror/theme/monokai.css" />
<script type="application/javascript" src="/assets/codemirror/lib/codemirror.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/display/fullscreen.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/search/search.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/lint/lint.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/lint/html-lint.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/search/searchcursor.js"></script>
<script type="application/javascript" src="/assets/codemirror/addon/search/jump-to-line.js"></script>
<script type="application/javascript" src="/assets/codemirror/mode/xml/xml.js"></script>
<script type="application/javascript" src="/assets/codemirror/mode/javascript/javascript.js"></script>
<script type="application/javascript" src="/assets/codemirror/mode/css/css.js"></script>
<script type="application/javascript" src="/assets/codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="/assets/speakingurl/speakingurl.min.js"></script>
<script>

	/*
	Remove value
	 */
	function removeValue(type, data) {
      var values = $("input[name='template_" + type + "']").val().toString().trim();
      values = values ? values.split(',') : [];
      var index = values.indexOf(data);
      if (index == -1) return;
      values.splice(index, 1);
      $("input[name='template_" + type + "']").val(values.join(','));
      $("." + type + "s").html(Handlebars.compile($("#template-" + type + "-item").html())({data: values}));
    }

    /*
    Add Value
     */
    function addValue(type) {
        var value = $("input[name='new_" + type + "']").val().toString().trim();
        if (!value) return;
        var values = $("input[name='template_" + type + "']").val().toString().trim();
        values = values ? values.split(',') : [];
        if (values.indexOf(value) > -1) return;
        $("input[name='new_" + type + "']").val('');
        values.push(value);
        $("input[name='template_" + type + "']").val(values.join(','));
        $("." + type + "s").html(Handlebars.compile($("#template-" + type + "-item").html())({data: values}));
    }

    // Render Groups
    var groups = $("input[name='template_group']").val().toString().trim() ? $("input[name='template_group']").val().toString().trim().split(",") : [];
    $(".groups").html(Handlebars.compile($("#template-group-item").html())({ data: groups }));

    // Render Departments
    var departments = $("input[name='template_department']").val().toString().trim() ? $("input[name='template_department']").val().toString().trim().split(",") : [];
    $(".departments").html(Handlebars.compile($("#template-department-item").html())({ data: departments }));

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
      $("input[list]").off("keyup").on("keyup", (e) => {
      	var keyCode = e.which || e.keyCode;
        if (keyCode == 13) $(e.target).parent().find("button").trigger("click");
      });

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
		$("input[name='p_title']").focus();
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
		  $(".list-group-item.empty").remove();
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
        target.find("[data-bind='name']").html(parameter.name);
        target.find("[data-bind='title']").html(parameter.title);
        target.find("[data-bind='type']").html(parameter.type);
        target.find("[data-bind='require']").html(parameter.require ? "true" : "false");
        target.find("[data-bind='default']").html(parameter.default);
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
        subject: $("input[name='template_subject']").val(),
        group: $("input[name='template_group']").val() ? $("input[name='template_group']").val().split(",") : [],
        department: $("input[name='template_department']").val() ? $("input[name='template_department']").val().split(",") : [],
        html: editor.getValue(),
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

    function deleteTemplate(id){
      if (!confirm("Emin misiniz?")) return;
      $("input, button, select, textarea").attr("disabled", "disabled");
      window.location = "/template/" + id + "/delete";
    }

    var editor = CodeMirror.fromTextArea($("textarea[name='template_html']")[0], {
      lineNumbers: false,
      mode: "htmlmixed"
    });

    $(document).on("keyup", function (e) {
	  var keycode = e.which || e.keyCode;
	  if (keycode === 27) {
        editor.setOption("lineNumbers", false);
        editor.setOption("fullScreen", false);
		$("body").removeClass("codemirror_full");
      }
    })

	$.get('/groups').then(groups => {
      var gTemplate = "<option value=\"%VALUE%\"/>";
	  groups.forEach(g => $("#group_list").append(gTemplate.replace("%VALUE%", g)));
	});

    $.get('/departments').then(departments => {
      var dTemplate = "<option value=\"%VALUE%\"/>";
      departments.forEach(g => $("#department_list").append(dTemplate.replace("%VALUE%", g)));
    })
</script>