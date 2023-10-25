import { showToast, validateId, validateValue } from "../lib/utils.js";

/** 값 추가 UI를 구현하는 AddValue Component */
export default class AddValue {
  constructor({ $target, state, onAdd }) {
    this.$target = $target;
    this.state = state;

    this.render();
    this.setEvent(onAdd);
  }

  render() {
    this.$target.innerHTML = `
      <div class="add-value__container">
        <input class="id-input" type="number" placeholder="id" />
        <input class="value-input" type="number" placeholder="value" />
        <button class="btn add-btn" type="button" style="min-width:4rem;">추가</button>
      </div>
      <div>
        <p class="helper-text">* id는 0초과의 양수 값만이 가능합니다. id는 중복될 수 없습니다.</p>
        <p class="helper-text">* 값은 양수 값만이 가능합니다.</p>
      </div>
      `;
  }

  setEvent(onAdd) {
    const idInput = this.$target.querySelector(".id-input");
    const valueInput = this.$target.querySelector(".value-input");
    const addBtn = this.$target.querySelector(".add-btn");

    addBtn.addEventListener("click", () => {
      const id = idInput.value ? Number(idInput.value) : null;
      const value = valueInput.value ? Number(valueInput.value) : null;

      const isDuplicated = this.state.some((s) => s.id === id);

      if (isDuplicated) {
        showToast("id는 중복될 수 없습니다.");
        return;
      }

      if (!validateId(id)) {
        showToast("id는 0초과의 양수 값만이 가능합니다.");
        return;
      }

      if (!validateValue(value)) {
        showToast("값은 양수 값만이 가능합니다. ");
        return;
      }

      onAdd({ id: id, value: value });
      showToast(`id가 ${id}인 데이터를 추가하였습니다.`);
    });
  }
}
