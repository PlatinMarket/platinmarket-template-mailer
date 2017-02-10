<h3 class="page-header">{{currentTemplate.name}} <small>{{currentTemplate.description}}</small></h3>
<div class="alert alert-danger" style="display: none;"></div>

{{#if currentTemplate.id}}
    <input type="hidden" name="template_name" value="{{currentTemplate.name}}" />
    <input type="hidden" name="template_id" value="{{currentTemplate.id}}" />
{{else}}
    <h4>Şablon adı</h4>
    <input type="text" name="template_name" value="" />
{{/if}}

<h4>Kısa Açıklama</h4>
<input type="text" name="template_description" value="{{currentTemplate.description}}" />

<h4>Aktif Departmanlar</h4>
<input type="text" value="" placeholder="Departman" name="new_department"/><button type="button" onclick="addDepartment()">+ Ekle</button>
<input type="hidden" value="{{currentTemplate.department}}" name="template_department" />
<div class="departments"></div>

<h4>Konu</h4>
<input name="tamplate_header" value="{{currentTemplate.subject}}" />

<h4>Mail Html</h4>
<textarea name="template_html">{{currentTemplate.html}}</textarea>

<br><br>
<label><input type="checkbox" name="template_textFallback" /> Text versiyonu var</label>
<div class="text_fallback" style="display: none">
    <h4>Mail text</h4>
    <textarea name="template_text">{{currentTemplate.text}}</textarea>
</div>

<h4>Parameters</h4>
<div class="parameters">
    {{#each currentTemplate.parameter}}
        <div class="parameter" data-name="{{name}}" style="border: 1px solid black; display: inline;">
            <input type="hidden" name="name" value="{{name}}" />
            <input type="hidden" name="title" value="{{title}}" />
            <input type="hidden" name="type" value="{{type}}" />
            {{#if require}}
                <input type="hidden" name="require" value="1" />
            {{else}}
                <input type="hidden" name="require" value="0" />
            {{/if}}
            <input type="hidden" name="default" value="{{default}}" />

            <span data-bind="title">{{title}}</span> [<span data-bind="name">{{name}}</span>]
            <button type="button" name="edit_parameter">Düzenle</button>
            <button type="button" name="delete_parameter">Sil</button>
        </div>
    {{/each}}
</div>

<fieldset style="border: 1px solid black">
    <h5 class="new_parameter">Yeni parametre ekle</h5>
    <h5 class="edit_parameter" style="display: none;">Parametre düzenle</h5>
    <input type="hidden" name="p_name" value="" />
    <label>Parametre adı:</label>
    <input type="text" name="p_title" data-slug-target="[name='p_name_show']" data-default-value=""/>
    <div class="p_name_zone">
        <label>Dosya adı:</label>
        <input type="text" name="p_name_show" />
    </div>
    <label>Tipi:</label>
    <select name="p_type" data-default-value="string">
        <option value="string">String</option>
        <option value="boolean">Doğru/Yanlış</option>
    </select>
    <label><input type="checkbox" name="p_require" data-default-value="1"> Zorunlu alan</label>
    <label>Varsayılan değer:</label>
    <input type="text" name="p_default" data-default-value=""/>
    <button type="button" name="add_parameter">Kaydet</button>
    <button type="button" name="cancel_parameter" style="display: none;">İptal</button>
</fieldset>


<button type="button" onclick="submit()">Şablonu Kaydet</button>


<script id="template-parameter-item" type="text/x-handlebars-template">
    <div class="parameter" data-name="\{{name}}" style="border: 1px solid black; display: inline;">
        <input type="hidden" name="name" value="\{{name}}" />
        <input type="hidden" name="title" value="\{{title}}" />
        <input type="hidden" name="type" value="\{{type}}" />
        \{{#if require}}
        <input type="hidden" name="require" value="1" />
        \{{else}}
        <input type="hidden" name="require" value="0" />
        \{{/if}}
        <input type="hidden" name="default" value="\{{default}}" />

        <span data-bind="title">\{{title}}</span> [<span data-bind="name">\{{name}}</span>]
        <button type="button" name="edit_parameter">Düzenle</button>
        <button type="button" name="delete_parameter">Sil</button>
    </div>
</script>

<script id="template-department-item" type="text/x-handlebars-template">
    \{{#each departments}}
        <span class="label label-primary">\{{this}} <button onclick="removeDepartment('\{{this}}');"><span class="glyphicon glyphicon-remove text-danger"></span></button></span>
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
        var target = $(this).closest('div.parameter');
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
      $("div.p_name_zone").show();
      $("h5.new_parameter").show();
      $("h5.edit_parameter").hide();
      $("button[name='cancel_parameter']").hide();
    }

    // Fill form by parameter
    function fillForm(parameter){
      console.log(parameter);
      $("input[name='p_title']").val(parameter.title).trigger("change");
      $("input[name='p_name']").val(parameter.name).trigger("change");
      $("div.p_name_zone").hide();
      $("select[name='p_type']").val(parameter.type).trigger("change");
      $("input[name='p_require']")[0].checked = parameter.require;
      $("input[name='p_default']").val(parameter.default).trigger("change");
      $("input[name='p_require']").trigger("change");
      $("h5.new_parameter").hide();
      $("h5.edit_parameter").show();
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