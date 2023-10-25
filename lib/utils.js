/** toast를 화면에 띄운다. (성공 혹은 에러 메세지 전달시 활용) */
export function showToast(message) {
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
export function formatChartValue(value) {
  const newValue = Math.round(value);

  if (newValue <= 10) {
    return Number(value.toFixed(1));
  }

  return newValue;
}

/** state를 id를 기준으로 오름차순 정렬한다. */
export function sortState(state) {
  return state.sort((a, b) => {
    return a.id - b.id;
  });
}

/**
 * id를 검증한다.
 * 현재 조건: id는 0초과의 양수만이 가능하다. id 중복 값은 불가하다.
 */
export function validateId(id, state) {
  const isDuplicated = state.some((s) => s.id === id);

  return (
    !isNaN(parseFloat(id)) &&
    isFinite(id) &&
    typeof id !== "string" &&
    id > 0 &&
    !isDuplicated
  );
}

/**
 * 값을 검증한다.
 * 현재 조건: 값은 양수만이 가능하다.
 */
export function validateValue(n) {
  return (
    !isNaN(parseFloat(n)) && isFinite(n) && typeof n !== "string" && n >= 0
  );
}

/** 값 고급 편집에서의 json 데이터를 검증한다. */
export function validateJson(json, state) {
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

  // 배열의 모든 요소가 주어진 형식을 따르는지 확인
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] !== "object" || data[i] === null) {
      return false;
    }

    const keys = Object.keys(data[i]);
    if (keys.length !== 2 || !("id" in data[i]) || !("value" in data[i])) {
      return false;
    }

    if (!validateId(data[i].id, state) || !validateValue(data[i].value)) {
      console.log(data[i].id, data[i].value);
      return false;
    }
  }

  // 모든 검사를 통과하면 true를 반환
  return true;
}
