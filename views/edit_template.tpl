<h3 class="page-header">{{currentTemplate.name}} <small>{{currentTemplate.description}}</small></h3>

<h4>Kısa Açıklama</h4>
<input type="text" name="description" value="{{currentTemplate.description}}" />

<h4>Aktif Departmanlar</h4>
<input type="text" value="" placeholder="Departman" name="new_department"/><button type="button" onclick="addDepartment()">+ Ekle</button>
<input type="hidden" value="{{currentTemplate.department}}" name="department" />
<div class="departments"></div>

<h4>Mail Html</h4>
<textarea name="html">{{currentTemplate.html}}</textarea>

<br><br>
<label><input type="checkbox" name="textFallback" /> Text versiyonu</label>
<div class="text_fallback" style="display: none">
    <h4>Mail text</h4>
    <textarea name="text">{{currentTemplate.text}}</textarea>
</div>

<h4>Parameters</h4>
<fieldset style="border: 1px solid black">
<label>Parametre adı:</label>
<input type="text" name="p_title" data-slug-target="[name='p_name']" data-default-value=""/>
<label>Dosya adı:</label>
<input type="text" name="p_name" />
<label>Tipi:</label>
<select name="p_type" data-default-value="string">
    <option value="string">String</option>
    <option value="boolean">Doğru/Yanlış</option>
</select>
<label><input type="checkbox" name="p_require" data-default-value="true" data-show-target=".p_has_default"> Zorunlu alan</label>
<div class="p_has_default" style="display: none;">
    <label>Varsayılan değer:</label>
    <input type="text" name="p_default" data-default-value=""/>
</div>
<button type="button" name="add_parameter">+ Ekle</button>
</fieldset>


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
        var departments = $("input[name='department']").val().toString().trim();
        departments = departments ? departments.split(',') : [];
        var index = departments.indexOf(department);
        if (index == -1) return;
        departments.splice(index, 1);
        $("input[name='department']").val(departments.join(','));
        $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    /*
    Add Department
     */
    function addDepartment() {
        var department = $("input[name='new_department']").val().toString().trim();
        if (!department) return;
        var departments = $("input[name='department']").val().toString().trim();
        departments = departments ? departments.split(',') : [];
        if (departments.indexOf(department) > -1) return;
        $("input[name='new_department']").val('');
        departments.push(department);
        $("input[name='department']").val(departments.join(','));
        $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    // Render Departments
    $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments: $("input[name='department']").val().toString().trim().split(',')}));

    // Text fallback
    if ({{currentTemplate.textFallback}}) $("input[name='textFallback']")[0].checked = true;
    $("input[name='textFallback']").on('change', (e) => {
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
    }

    // Reset Parameter add form
    function resetForm(){
      $("[data-default-value]").each(function(){
        switch (true) {
          case ($(this).attr('type') == 'checkbox'):
            $(this)[0].checked = ($(this).attr('data-default-value') === 'true');
            break;
          default:
            $(this).val($(this).attr('data-default-value'));
            break;
        }
        $(this).trigger('change');
      });
    }

    refreshListeners();
    resetForm();
</script>