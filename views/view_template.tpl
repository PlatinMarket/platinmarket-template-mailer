{{#if user.isSuper}}
    <a href="/template/{{currentTemplate.id}}/edit" class="btn">Düzenle</a>
{{/if}}

<br>
<br>
<br>

<form action="/template/{{currentTemplate.id}}/render" method="post" target="preview">
{{#each currentTemplate.parameter}}
    <label>{{title}}</label>
    <input name="{{name}}" value="{{default}}" class="{{#if require}}required{{/if}}" />
    <br>
{{/each}}
    <button type="submit">Önizle</button>
</form>

<br>
<br>
<iframe name="preview"></iframe>