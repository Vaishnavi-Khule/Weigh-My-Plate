import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PieChart = ({ item }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (item && item.food.length > 0 && chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const myChartRef = chartRef.current.getContext("2d");

            // Merge items with the same label and sum their calorie counts
            const mergedData = item.food.reduce((acc, curr) => {
                if (acc[curr.food_name]) {
                    acc[curr.food_name] += curr.cal;
                } else {
                    acc[curr.food_name] = curr.cal;
                }
                return acc;
            }, {});

            const foodLabels = Object.keys(mergedData);
            const foodCalories = Object.values(mergedData);

            chartInstance.current = new Chart(myChartRef, {
                type: 'pie',
                data: {
                    labels: foodLabels,
                    datasets: [{
                        data: foodCalories,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            // Add more colors as needed
                        ],
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                font: {
                                    size: 16, // Adjust the font size here
                                }
                            }
                        }
                    }
                    // Add more options for the pie chart if needed
                }
            });
        }
    }, [item]);

    return (
        <div className="pieChartContainer">
            <canvas id="myPieChart" ref={chartRef} width={400} height={400} /> {/* Set the width and height here */}
        </div>
    );
};

export default PieChart;
