import { formatChartValue } from "../lib/utils.js";

/** 그래프 UI를 구현하는 Graph Component */
export default class Graph {
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
