// src/infrastructure/FileService.js

class FileService {
    exportData(mode, data) {
        let filename;
        if (mode === 'equipment') {
            filename = 'equipment_comparison_data.json';
        } else if (mode === 'pvp') {
            filename = 'pvp_simulation_data.json';
        } else {
            return;
        }
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event, callback) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                callback(data);
            } catch (error) {
                alert('Error parsing JSON file.');
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    }
}
