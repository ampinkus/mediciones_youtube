const ctx = document.getElementById("graficoYoutube").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels, // Eje X (fecha + hora)
    datasets: [
      {
        label: "Vistas del Stream - " + nombreStream,
        data: data, // Eje Y (vistas del video)
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: false,
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "black",
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: "time", // 🔹 Eje temporal
        time: {
          tooltipFormat: "dd/MM - HH:mm", // 🔹 Formato tooltip
          displayFormats: {
            hour: "dd/MM - HH:mm", // 🔹 Formato en el eje
            minute: "dd/MM - HH:mm",
          },
        },
        ticks: {
          color: "black",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "#cccccc",
        },
        title: {
          display: true,
          text: "Fecha y hora de medición",
          color: "black",
          font: {
            size: 16,
          },
        },
      },

      y: {
        ticks: {
          color: "black",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "#cccccc",
        },
        title: {
          display: true,
          text: "Vistas del Stream",
          color: "black",
          font: {
            size: 16,
          },
        },
      },
    },
  },
});
