function fmt(x, decimals = 4) {
  if (!isFinite(x)) return "—";
  const abs = Math.abs(x);
  if (abs >= 1000000) return x.toFixed(0);
  if (abs >= 1000) return x.toFixed(2);
  if (abs >= 1) return x.toFixed(4);
  return x.toFixed(decimals);
}

const PRESETS = {
  custom: null,
  subscription_hourly: {
    principal: 1000,
    apy: 8,
    routing: 25,
    costPerRun: 0.02,
    runsPerDay: 24,
    label: "Subscription / recurring payment (hourly)"
  },
  oracle_5min: {
    principal: 5000,
    apy: 8,
    routing: 25,
    costPerRun: 0.005,
    runsPerDay: 288,
    label: "Oracle update / data feed (every 5 min)"
  },
  nft_daily: {
    principal: 500,
    apy: 8,
    routing: 25,
    costPerRun: 0.05,
    runsPerDay: 1,
    label: "Dynamic NFT update (daily)"
  },
  stoploss_event: {
    principal: 2000,
    apy: 8,
    routing: 25,
    costPerRun: 0.03,
    runsPerDay: 6,
    label: "Stop-loss / conditional order (event-driven)"
  },
};

function setInputs(values) {
  if (!values) return;
  document.getElementById("principal").value = values.principal;
  document.getElementById("apy").value = values.apy;
  document.getElementById("routing").value = values.routing;
  document.getElementById("costPerRun").value = values.costPerRun;
  document.getElementById("runsPerDay").value = values.runsPerDay;
}

function recalc() {
  const principal = Number(document.getElementById("principal").value);
  const apy = Number(document.getElementById("apy").value);
  const routing = Number(document.getElementById("routing").value);
  const costPerRun = Number(document.getElementById("costPerRun").value);
  const runsPerDay = Number(document.getElementById("runsPerDay").value);

  // Simple conceptual model:
  // annual yield = principal * apy
  // routed yield = annual yield * routingFraction
  // daily routed credits = routed yield / 365
  const annualYield = principal * (apy / 100);
  const routedAnnual = annualYield * (routing / 100);
  const dailyYieldCredits = routedAnnual / 365;

  const dailyCost = costPerRun * runsPerDay;
  const dailyNet = dailyYieldCredits - dailyCost;

  // Useful extra numbers for a stronger demo
  const denom = (apy / 100) * (routing / 100);
  const breakEvenPrincipal = denom > 0 ? (dailyCost * 365) / denom : Infinity;
  const maxRunsPerDay = costPerRun > 0 ? dailyYieldCredits / costPerRun : Infinity;

  document.getElementById("dailyYield").textContent = `${fmt(dailyYieldCredits)} credits/day`;
  document.getElementById("dailyCost").textContent = `${fmt(dailyCost)} credits/day`;
  document.getElementById("dailyNet").textContent = `${fmt(dailyNet)} credits/day`;
  document.getElementById("breakEven").textContent = `${fmt(breakEvenPrincipal)} RLO`;
  document.getElementById("maxRuns").textContent = `${fmt(maxRunsPerDay)} runs/day`;

  const verdict = document.getElementById("verdict");
  if (dailyNet > 0) {
    verdict.textContent = `✅ Sustainable (under these assumptions). The workflow can keep running without manual top-ups.`;
  } else if (dailyNet === 0) {
    verdict.textContent = `➖ Break-even (under these assumptions). Any variance could cause failures.`;
  } else {
    verdict.textContent = `⚠️ Not sustainable (under these assumptions). Increase stake/routing, or reduce cost/frequency.`;
  }

  const presetId = document.getElementById("preset").value;
  const presetLabel = (PRESETS[presetId] && PRESETS[presetId].label) ? PRESETS[presetId].label : "Custom";

  const script = `
Hi everyone. My English is not good, so I will keep it short.

This is a small demo I built: a Stake-for-Service (SfS) budget calculator.

Idea:
1) Reactive transactions can run automatically when a condition is true (time / price / events).
2) Stake-for-Service can route staking yield into service credits to pay for recurring costs.
So a recurring workflow can be self-funding.

Scenario: ${presetLabel}
Assumptions:
- staked principal = ${principal} RLO
- APY = ${apy}%
- routing fraction = ${routing}% of yield → credits
- each run costs ${costPerRun} credits
- runs per day = ${runsPerDay}

Result:
- daily routed credits = ${fmt(dailyYieldCredits)}
- daily cost = ${fmt(dailyCost)}
- net = ${fmt(dailyNet)}

Extra:
- break-even stake ≈ ${fmt(breakEvenPrincipal)} RLO
- max sustainable frequency ≈ ${fmt(maxRunsPerDay)} runs/day

Thank you. If you have questions, please type in chat and I will answer slowly.
`.trim();

  document.getElementById("scriptBox").textContent = script;

  const korean = `
안녕하세요. 제 영어가 부족해서 짧게 말씀드릴게요.

제가 만든 건 Stake-for-Service(SfS) 예산(버짓) 계산기입니다.

핵심 아이디어는 2가지예요.
1) Reactive transaction은 (시간/가격/이벤트 같은) 조건이 True가 되면 체인이 실행을 트리거할 수 있습니다.
2) Stake-for-Service는 스테이킹 수익의 일부를 ServicePaymaster를 통해 서비스 크레딧으로 바꿔서,
   가스/스토리지/반복 실행 같은 네트워크 비용을 자동으로 내는 모델입니다.

그래서 "반복 실행되는 워크플로가 스스로 비용을 감당하면서 계속 돌아갈 수 있나?"를
간단한 가정으로 계산해봅니다.

오늘 시나리오: ${presetLabel}
가정값:
- 스테이킹 원금: ${principal} RLO
- APY: ${apy}%
- 라우팅 비율: ${routing}% (수익 → 크레딧)
- 1회 실행 비용: ${costPerRun} credits
- 하루 실행 횟수: ${runsPerDay}

결과:
- 하루 크레딧 유입: ${fmt(dailyYieldCredits)}
- 하루 비용: ${fmt(dailyCost)}
- 순이익/적자: ${fmt(dailyNet)}

추가로:
- 손익분기 스테이킹 원금: 약 ${fmt(breakEvenPrincipal)} RLO
- 최대 지속 가능한 하루 실행 횟수: 약 ${fmt(maxRunsPerDay)}회

질문은 채팅에 영어로 적어주시면, 제가 천천히 답변하겠습니다.
`.trim();

  document.getElementById("koreanBox").textContent = korean;
}

function onPresetChange() {
  const id = document.getElementById("preset").value;
  if (id && PRESETS[id]) {
    setInputs(PRESETS[id]);
  }
  recalc();
}

document.getElementById("calcBtn").addEventListener("click", recalc);
document.getElementById("preset").addEventListener("change", onPresetChange);
window.addEventListener("load", recalc);
