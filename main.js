import { sortState } from "./lib/utils.js";

import Graph from "./components/01-graph.js";
import EditValue from "./components/02-edit-value.js";
import AddValue from "./components/03-add-value.js";
import AdvancedEditValue from "./components/04-advanced-edit-value.js";

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

new App(document.getElementById("app"));
