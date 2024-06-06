<template>
  <div id="app">
    <h1>Room Cleanliness Checker</h1>
    <div class="file-upload">
      <input type="file" @change="onFileChange" accept="image/*" />
      <button @click="checkImage">Check Image</button>
    </div>
    <div v-if="result" class="result">
      <h2>Result: {{ result }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageFile: null,
      result: null,
    };
  },
  methods: {
    onFileChange(e) {
      this.imageFile = e.target.files[0];
    },
    async checkImage() {
      if (!this.imageFile) {
        alert('Please select an image file.');
        return;
      }
      const formData = new FormData();
      formData.append('image', this.imageFile);

      try {
        const response = await fetch('http://localhost:3001/image', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const responseData = await response.json();
        this.result = responseData.data;
      } catch (error) {
        console.error('Error:', error);
        this.result = 'Failed to check the image. Please try again.';
      }
    },
  },
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  color: #333;
  font-family: 'Arial', sans-serif;
}

.file-upload {
  margin-bottom: 20px;
}

input[type="file"] {
  margin-right: 10px;
  padding: 8px 10px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

.result {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
