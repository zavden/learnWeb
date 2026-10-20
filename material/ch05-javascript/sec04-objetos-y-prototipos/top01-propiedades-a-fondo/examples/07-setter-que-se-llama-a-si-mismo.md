---
example_description: "Un setter que asigna a su propia propiedad se llama a sí mismo sin fin (Maximum call stack size exceeded); el dato debe vivir en otra propiedad o en un closure"
example_tags: "javascript|python|getters|setters|recursion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 El setter quiere guardar el email normalizado… en la propiedad email.
// Pero this.email = … es OTRA asignación a email: vuelve a llamar al setter,
// que vuelve a asignar, que vuelve a llamar… hasta llenar la pila.
const account = {
  set email(value) {
    this.email = value.trim().toLowerCase();
  },
  get email() {
    return this.email; // 🐛 y el getter se lee a sí mismo
  },
};
try {
  account.email = '  Lucia.Perez@Example.COM ';
} catch (error) {
  console.log('🐛 set →', error.name, '|', error.message);
}
try {
  console.log(account.email);
} catch (error) {
  console.log('🐛 get →', error.name, '|', error.message);
}

// ✅ Solución 1: guardar el dato en OTRA propiedad (convención _email).
const accountA = {
  _email: '',
  set email(value) {
    this._email = value.trim().toLowerCase();
  },
  get email() {
    return this._email;
  },
};
accountA.email = '  Lucia.Perez@Example.COM ';
console.log('✅ con _email →', accountA.email);

// ✅ Solución 2: guardarlo en una variable de un closure (lección «Closures»).
// Así nadie puede saltarse el setter escribiendo _email directamente.
function createAccount() {
  let email = '';
  return {
    set email(value) {
      email = value.trim().toLowerCase();
    },
    get email() {
      return email;
    },
  };
}
const accountB = createAccount();
accountB.email = '  Lucia.Perez@Example.COM ';
console.log('✅ con closure →', accountB.email);
console.log('claves de accountB →', Object.keys(accountB)); // ['email']: no hay dato a la vista

// > Desde Python: el mismo bug existe con @property si el setter hace
//   self.email = value (RecursionError). Allí también se guarda en self._email.
```
