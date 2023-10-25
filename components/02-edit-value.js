import { showToast, validateValue } from "../lib/utils.js";

/** 값 편집 UI를 구현하는 EditValue Component */
export default class EditValue {
  constructor({ $target, state, onDelete, onApply }) {
    this.$target = $target;
    this.state = state;

    this.render();
    this.setEvent(onApply, onDelete);
  }

  render() {
    this.$target.innerHTML = `
      <table class="edit-table">
        <thead>
          <tr class="edit-table__tr">
            <th class="edit-table__th">ID</th>
            <th class="edit-table__th">값</th>
            <th class="edit-table__th">설정</th>
          </tr>
        </thead>
        <tbody>
          ${this.state
            .map(
              ({ id, value }) => `
                <tr class="edit-table__tr">
                  <td class="edit-table__td">${id}</td>
                  <td><input data-apply-id="${id}" class="value-input" type="number" value="${value}" style="width:80%;" /></td>
                  <td><button data-delete-id="${id}" class="btn btn--delete delete-btn">삭제</button></td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      ${
        this.state.length === 0
          ? `<div class="no-data">데이터를 먼저 추가해주세요.</div>`
          : ""
      }
      <div class="button-box">
        <button ${
          this.state.length === 0 ? `disabled` : ""
        } class="btn btn--apply apply-btn">적용</button>
      </div>
      `;
  }

  setEvent(onApply, onDelete) {
    const deleteButtons = this.$target.querySelectorAll(".delete-btn");
    const valueInputs = this.$target.querySelectorAll(".value-input");
    const applyBtn = this.$target.querySelector(".apply-btn");

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const targetId = Number(e.target.dataset["deleteId"]);
        onDelete(targetId);
        showToast(`id가 ${targetId}인 데이터를 삭제하였습니다.`);
      });
    });

    applyBtn.addEventListener("click", () => {
      const newState = Array.from(valueInputs).map((i) => ({
        id: i.dataset["applyId"] ? Number(i.dataset["applyId"]) : null,
        value: i.value ? Number(i.value) : null,
      }));

      const isValidationSuccess = newState.every((s) => validateValue(s.value));

      if (!isValidationSuccess) {
        showToast("값은 양수 값만을 적용할 수 있습니다.");
        return;
      }

      onApply(newState);
      showToast(`적용이 완료되었습니다.`);
    });
  }
}
