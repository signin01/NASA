import Chart from "chart.js/auto";

export function applyCosmosChartDefaults() {
  Chart.defaults.color = "rgba(232,244,248,0.75)";
  Chart.defaults.borderColor = "rgba(0,245,255,0.12)";
  Chart.defaults.font.family = "'Share Tech Mono', monospace";
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(0,0,10,0.92)";
  Chart.defaults.plugins.tooltip.borderColor = "rgba(0,245,255,0.35)";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
}

export function createLineChart(canvas, labels, data, label = "Signal", color = "#00f5ff") {
  return new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: `${color}22`,
          tension: 0.28,
          fill: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#e8f4f8"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(232,244,248,0.6)",
            maxTicksLimit: 8
          },
          grid: {
            color: "rgba(0,245,255,0.08)"
          }
        },
        y: {
          ticks: {
            color: "rgba(232,244,248,0.6)"
          },
          grid: {
            color: "rgba(0,245,255,0.08)"
          }
        }
      }
    }
  });
}

export function createRadarChart(canvas, labels, data, label = "Profile") {
  return new Chart(canvas, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: "#bf5fff",
          backgroundColor: "rgba(191,95,255,0.2)",
          pointBackgroundColor: "#00f5ff"
        }
      ]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            color: "rgba(0,245,255,0.12)"
          },
          grid: {
            color: "rgba(0,245,255,0.12)"
          },
          pointLabels: {
            color: "#e8f4f8"
          },
          ticks: {
            color: "#e8f4f8",
            backdropColor: "transparent"
          }
        }
      }
    }
  });
}
