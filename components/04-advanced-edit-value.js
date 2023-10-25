import { showToast, validateJson } from "../lib/utils.js";

/** 값 고급 편집 UI를 구현하는 AdvancedEditValue Component */
export default class AdvancedEditValue {
  constructor({ $target, state, onApply }) {
    this.$target = $target;
    this.state = state;

    this.render();
    this.setEvent(onApply);
  }

  render() {
    this.$target.innerHTML = `
      <div class="advanced-edit-value__container">
        <textarea class="json-textarea">${JSON.stringify(
          this.state,
          null,
          2
        ).trim()}</textarea>
        <div class="button-box">
          <button class="btn btn--apply apply-btn" type="button">적용</button>
        </div>
      <div>
    `;
  }

  setEvent(onApply) {
    const applyBtn = this.$target.querySelector(".apply-btn");
    const jsonTextarea = this.$target.querySelector(".json-textarea");

    applyBtn.addEventListener("click", () => {
      if (!validateJson(jsonTextarea.value, this.state)) {
        showToast(
          '형식에 맞게 작성해주세요.\n 예시: [{"id": 1, "value": 10}, {"id": 2, "value": 20}]'
        );
        return;
      }

      onApply(JSON.parse(jsonTextarea.value));
      showToast(`적용이 완료되었습니다.`);
    });
  }
}
