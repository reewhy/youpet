<script setup lang="ts">
import { StreamQrcodeBarcodeReader} from 'vue3-barcode-qrcode-reader';
import {ref, onErrorCaptured, onMounted} from "vue";
import { useNotification } from "@kyvg/vue3-notification";
import { ProductModel } from "../types/common"



const { notify } = useNotification();

const isbn = ref(undefined);
const message = ref('');
const product = ref(undefined);

function isbn13to10(isbn13) {
  // Ensure the input is a valid ISBN-13
  if (isbn13.length !== 13 || isbn13.substring(0, 3) !== '978') {
    throw new Error('Invalid ISBN-13. Must start with 978 and be 13 digits long.');
  }

  // Extract the first 9 digits after '978'
  const isbn10Base = isbn13.substring(3, 12);

  // Calculate the checksum for ISBN-10
  let checksum = 0;
  for (let i = 0; i < 9; i++) {
    checksum += (10 - i) * parseInt(isbn10Base.charAt(i), 10);
  }

  // Modulus 11 of the checksum
  checksum = (11 - (checksum % 11)) % 11;

  // If checksum is 10, it should be 'X', otherwise it's the number itself
  const checkDigit = (checksum === 10) ? 'X' : checksum.toString();

  // Return the ISBN-10
  return isbn10Base + checkDigit;
}

function onResult(result) : Promise<ProductModel>{
  if(result !== undefined){
    let url = 'http://localhost:3000/products/?isbn=' + result.text;
    console.log(result.text);
    isbn.value = result.text;
    getProduct(url)

  }
}

function getProduct(url, check = true){
  try{
    fetch(url)
        .then(response => response.json())
        .then(data => {
          if(data !== undefined){
            console.log(data);
            if(check) product.value = data[0];

            console.log(product.value.name)
            return data[0];
          }
        })
  } catch(error){
    console.log(error);
  }
}

let test = isbn13to10('9788806231842');

function onLoading(){
  console.log("Caricato");
}

function submitProduct(event: SubmitEvent) {
  event.preventDefault();
  const isbn = event.target["isbn"].value;

  const prod = getProduct('http://localhost:3000/products/?isbn=' + isbn, false);
  if (prod !== undefined) {
    return;
  }

  const name = event.target["name"].value;
  const pet = event.target["pet"].value;
  const weight = event.target["weight"].value;
  const img_url = event.target["img_url"].value;
  const qs = event.target["qs"].value;

  const data = {
    isbn: isbn,
    name: name,
    pet: pet,
    weight: weight,
    img_url: img_url,
    qs: qs,
  }

  try {
    fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )
  } catch (e) {
    console.error(e)
  }
}


onErrorCaptured((err) => {
  notify({
    title: "Error",
    text: err,
    type: "error",
  })
  return false;
});
</script>

<template>
  <notifications/>
  <div v-if="product !== undefined" class="grid place-items-center">
    <p class="text-sm">{{ isbn }}</p>
    <p class="text-2xl font-bold" >{{ product.name }}</p>
    <p class="text-lg" >{{ product.producer }}</p>
    <p class="text-lg"><span :class="{
      'text-green-500': product.qs > 66,
      'text-yellow-400': product.qs > 33 && product.qs < 67,
      'text-red-500': product.qs < 34
    }" class="text-3xl">● </span>{{product.qs}}/100</p>
    <p class="mb-2 max-h-1rem"><img :src="product.img_url" class="h-80"></p>
  </div>
  <div v-if="product === undefined" class="grid place-items-center mb-2">
    <h2>Product not showing up?</h2>
    <form @submit="submitProduct" class="grid mb-2">
      <input type="text" name="isbn" :value="isbn" placeholder="isbn">
      <input type="text" name="name" placeholder="Name">
      <input type="text" name="producer" placeholder="Producer">
      <input type="text" name="pet" placeholder="Pet">
      <input type="text" name="weight" placeholder="Weight">
      <input type="text" name="img_url" placeholder="Image Url">
      <input type="text" name="qs" placeholder="Quality score (1-100)">
      <input type="submit" class="bg-blue-200 px-6 py-1 rounded">
    </form>
    <button class="bg-blue-500 px-6 py-1 rounded" onclick="">Submit new product</button>
  </div>

  <StreamQrcodeBarcodeReader
      capture="shoot"
      @onloading="onLoading"
      @result="onResult"
      class="rounded-2xl"
  >
    <template #actions="{ onCanPlay, isReset, onReset }">
      <div class="flex justify-center">
        <button class="bg-green-600 px-6 py-1 rounded" @click="onCanPlay">Stream</button>
        <button v-if="isReset" class="bg-blue-600 px-6 py-1 rounded ms-2" @click="onReset()">
          Reset
        </button>
      </div>
    </template>

    <template #action-facemode="{ onChangeFacemode }">
      <div class="container-btn-facemode grid place-items-center mt-1">
        <button
            class="bg-red-300 w-10 h-10 p-2 inline-flex justify-center items-center rounded-full"
            @click="onChangeFacemode"
        >
        </button>
      </div>
    </template>
  </StreamQrcodeBarcodeReader>
</template>
