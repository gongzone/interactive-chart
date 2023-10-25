// import Graph from "./components/01-graph.js";
// import EditValue from "./components/02-edit-value.js";
// import AddValue from "./components/03-add-value.js";
// import AdvancedEditValue from "./components/04-advanced-edit-value.js";

/**
 * !중요
 * 초기에 역할 별로 파일을 분리하여 코드를 작성하였습니다. (<script type="module"/>)
 * 그러나 CORS 정책에 의해 로컬에서 웹서버를 통하지 않고서는 index.html 파일 실행이 불가합니다.
 * (file protocol을 통한 자바스크립트 모듈 호출 불가)
 * 따라서 해당 파일인 main.js에 모든 로직을 모아놨습니다.
 * 가독성 측면에서 components 폴더와 lib 폴더를 참조하시는 것을 추천드립니다.
 */

/** 상태와 하위 컴포넌트들을 총 관리하는 App Component (엔트리 포인트) */
class App {
  constructor($app) {
    this.$app = $app;
    this.state = [];

    this.render();
  }

  setState(cb) {
    const result = cb(this.state);
    sortState(result);
    this.state = result;

    this.render();
  }

  render() {
    this.$app.innerHTML = `
      <section class="section">
        <h2 class="title">1. 그래프</h2>
        <div id="graph"></div>
      </section>
      <section class="section">
        <h2 class="title">2. 값 편집</h2>
        <div id="edit-value"></div>
      </section>
      <section class="section">
        <h2 class="title">3. 값 추가</h2>
        <div id="add-value"></div>
      </section>
      <section class="section">
        <h2 class="title">4. 값 고급 편집</h2>
        <div id="advanced-edit-value"></div>
      </section>
    `;

    // 하위 컴포넌트 렌더링
    new Graph({
      $target: this.$app.querySelector("#graph"),
      state: this.state,
    });

    new EditValue({
      $target: this.$app.querySelector("#edit-value"),
      state: this.state,
      onDelete: (targetId) =>
        this.setState((prev) => prev.filter((p) => p.id !== targetId)),
      onApply: (newState) => this.setState(() => newState),
    });

    new AddValue({
      $target: this.$app.querySelector("#add-value"),
      state: this.state,
      onAdd: ({ id, value }) =>
        this.setState((prev) => [...prev, { id, value }]),
    });

    new AdvancedEditValue({
      $target: this.$app.querySelector("#advanced-edit-value"),
      state: this.state,
      onApply: (newState) => this.setState(() => newState),
    });
  }
}

/********************** 01-Graph Component **********************/

/** 그래프 UI를 구현하는 Graph Component */
class Graph {
  constructor({ $target, state }) {
    this.$target = $target;
    this.state = state;

    this.height = 250; // Chart 최대 높이 값 정적 설정
    this.maxValue = Math.max(...state.map(({ value }) => value));

    this.render();
  }

  render() {
    this.$target.innerHTML = `
      <div class="graph__container ${
        this.state.length === 0 ? "graph__container--1" : "graph__container--2"
      }">
        ${this.state.length > 0 ? `<ul id="chart-values"></ul>` : ""}
        <div class="graph__container__inner">
          <ul id="chart-lines"></ul>
          <ul id="chart-bars"></ul>
        </div>
      </div>
    `;

    // 하위 컴포넌트 렌더링
    new ChartValues({
      $target: this.$target.querySelector("#chart-values"),
      maxValue: this.maxValue,
    });

    new ChartLines({
      $target: this.$target.querySelector("#chart-lines"),
      height: this.height,
    });

    new ChartBars({
      $target: this.$target.querySelector("#chart-bars"),
      state: this.state,
      height: this.height,
      maxValue: this.maxValue,
    });
  }
}

/** 그래프 세로 값의 UI를 구현하는 ChartValues Component */
class ChartValues {
  constructor({ $target, maxValue }) {
    this.$target = $target;
    this.maxValue = maxValue;

    this.render();
  }

  render() {
    if (!this.$target) {
      return "";
    }

    // 최대 값이 0인 경우, 세로 값 0 하나만을 표시
    if (this.maxValue === 0) {
      this.$target.innerHTML = `
        <li>
          <span>0</span>
        </li>
      `;
      return;
    }

    this.$target.innerHTML = `
      ${Array.from({ length: 6 })
        .map(
          (_, i) => `
            <li>
              <span>${formatChartValue((this.maxValue / 5) * i)}</span>
            </li>
          `
        )
        .join("")}
    `;
  }
}

/** 그래프의 세로 값과 이어지는 선 UI를 구현하는 ChartLines Component */
class ChartLines {
  constructor({ $target, height }) {
    this.$target = $target;
    this.height = height;

    this.render();
  }

  render() {
    this.$target.innerHTML = `
      ${Array.from({ length: 5 })
        .map(
          (_, i) =>
            `<div class="chart-line" style="bottom:${
              (this.height / 5) * (i + 1)
            }px"></div>
        `
        )
        .join("")}
    `;
  }
}

/** 그래프 막대 바 UI를 구현하는 ChartBars Component */
class ChartBars {
  constructor({ $target, state, height, maxValue }) {
    this.$target = $target;
    this.state = state;
    this.height = height;
    this.maxValue = maxValue;

    this.render();
  }

  render() {
    this.$target.innerHTML = `
      ${this.state
        .map(
          ({ id, value }) =>
            `<li class="chart-bars__li">
              <div class="chart-bars__li__item" style="height:${
                this.maxValue === 0 ? 0 : (value / this.maxValue) * this.height
              }px"></div>
              <span class="chart-bars__li__id">${id}</span>
            </li>
            `
        )
        .join("")}
    `;
  }
}

/********************** 01-Graph Component - End **********************/

/********************** 02-EditValue Component **********************/

/** 값 편집 UI를 구현하는 EditValue Component */
class EditValue {
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

/********************** 02-EditValue Component - End **********************/

/********************** 03-AddValue Component **********************/

/** 값 추가 UI를 구현하는 AddValue Component */
class AddValue {
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

/********************** 03-AddValue Component - End **********************/

/********************** 04-AdvancedEditValue Component **********************/

/** 값 고급 편집 UI를 구현하는 AdvancedEditValue Component */
class AdvancedEditValue {
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
      if (!validateJson(jsonTextarea.value)) {
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

/********************** 04-AdvancedEditValue Component - End **********************/

/********************** 유틸 함수 **********************/

/** toast를 화면에 띄운다. (성공 혹은 에러 메세지 전달시 활용) */
function showToast(message) {
  let toast = document.getElementById("toast");

  if (toast) {
    toast.innerText = message;
    toast.classList.add("show");

    // 앞선 setTimeout이 아직 끝나지 않은 상태에서 showToast가 다시 호출되는 것을 방지
    clearTimeout(toast.timeoutId);

    toast.timeoutId = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

/** 차트의 값을 알아보기 쉽게 변환한다. */
function formatChartValue(value) {
  const newValue = Math.round(value);

  if (newValue <= 10) {
    return Number(value.toFixed(1));
  }

  return newValue;
}

/** state를 id를 기준으로 오름차순 정렬한다. */
function sortState(state) {
  return state.sort((a, b) => {
    return a.id - b.id;
  });
}

/**
 * id를 검증한다.
 * 현재 조건: id는 0초과의 양수만이 가능하다. id 중복 값은 불가하다.
 */
function validateId(id) {
  return (
    !isNaN(parseFloat(id)) && isFinite(id) && typeof id !== "string" && id > 0
  );
}

/**
 * 값을 검증한다.
 * 현재 조건: 값은 양수만이 가능하다.
 */
function validateValue(n) {
  return (
    !isNaN(parseFloat(n)) && isFinite(n) && typeof n !== "string" && n >= 0
  );
}

/** 값 고급 편집에서의 json 데이터를 검증한다. */
function validateJson(json) {
  let data = null;

  try {
    data = JSON.parse(json);
  } catch {
    return false;
  }
  // 입력값이 배열인지 확인
  if (!Array.isArray(data)) {
    return false;
  }

  const duplicationHash = {};

  // 배열의 모든 요소가 주어진 형식을 따르는지 확인
  for (let i = 0; i < data.length; i++) {
    if (duplicationHash[data[i].id]) {
      return false;
    }

    if (typeof data[i] !== "object" || data[i] === null) {
      return false;
    }

    const keys = Object.keys(data[i]);
    if (keys.length !== 2 || !("id" in data[i]) || !("value" in data[i])) {
      return false;
    }

    if (!validateId(data[i].id) || !validateValue(data[i].value)) {
      console.log(
        !validateId(data[i].id, state),
        !validateValue(data[i].value)
      );
      return false;
    }

    duplicationHash[data[i].id] = true;
  }

  // 모든 검사를 통과하면 true를 반환
  return true;
}

/********************** 유틸 함수 - End **********************/

new App(document.getElementById("app")); // 애플리케이션 실행
