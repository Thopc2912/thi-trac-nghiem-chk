<!-- pages/index.vue -->
<template>
  <div class="relative min-h-screen">
    <!-- Ảnh nền -->
    <div
      class="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
      style="background-image: url('/bg-aht.jpg');"
    ></div>

    <!-- Lớp phủ giúp chữ dễ đọc -->
    <div class="absolute inset-0 -z-0 bg-white/10 backdrop-blur-[0px]"></div>

    <!-- Nội dung -->
    <div class="relative p-6 flex flex-col items-center">
      <h1 class="text-3xl font-bold text-white mb-6 text-center">
        🛫 THI TRẮC NGHIỆM CHK CHO NỘI BỘ PKT-AHT
      </h1>

      <!-- Nhập thông tin -->
      <div v-if="phase === 'intro'" class="w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input
              v-model="fullName"
              type="text"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Nhập họ tên..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vị trí đội</label>
            <input
              v-model="position"
              type="text"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Đội ĐTTH, Đội CĐ, Đội DNCT, Đội Bảo Trì..."
            />
          </div>

          <div class="pt-2">
            <button
              :disabled="!fullName || !position || starting"
              @click="startExam"
              class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-80"
            >
              🚀 Bắt đầu làm bài (50 câu / 50 phút)
            </button>
          </div>
          <p class="text-sm font-bold text-red-600 text-center mt-2 tracking-wide">
            🤝 CHÍNH TRỰC - TẬN TÂM - TRÁCH NHIỆM - HỢP TÁC - ĐỔI MỚI
          </p>
        </div>
      </div>

      <!-- Làm bài -->
      <div
        v-else-if="phase === 'doing'"
        class="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-xl"
      >
        <div v-if="timeLeft > 0">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-600">
              👤 <span class="font-medium">{{ fullName }}</span> —
              <span class="italic">{{ position }}</span>
            </p>
            <p class="text-right text-sm text-gray-600">
              ⏱️ Thời gian còn lại:
              <span class="font-bold text-red-600">{{ formatTime(timeLeft) }}</span>
            </p>
          </div>

          <!-- ✅ Cho phép HTML trong câu hỏi -->
          <p
            class="text-lg font-semibold mb-4"
            v-html="(currentIndex + 1) + '. ' + currentQuestion.question"
          ></p>

          <!-- ✅ Cho phép HTML trong đáp án -->
          <div class="space-y-3 mb-6">
            <label
              v-for="ltr in letters"
              :key="ltr"
              class="flex items-center gap-2 border p-2 rounded-lg cursor-pointer hover:bg-indigo-50"
            >
              <input
                type="radio"
                :name="'q' + currentIndex"
                :value="ltr"
                v-model="answers[currentIndex]"
                class="text-indigo-600 focus:ring-indigo-500"
              />
              <span v-html="ltr + '. ' + currentQuestion[ltr]"></span>
            </label>
          </div>

          <!-- Nút điều hướng -->
          <div class="flex justify-between items-center gap-2">
            <div class="flex gap-2">
              <button
                v-if="currentIndex > 0"
                @click="prevQuestion"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ◀ Quay lại
              </button>

              <!-- 🔸 Nút câu chưa làm -->
              <button
                @click="openUnansweredModal"
                class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                📋 Câu chưa làm
              </button>
            </div>

            <button
              v-if="currentIndex < questions.length - 1"
              @click="nextQuestion"
              class="ml-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Tiếp theo ▶
            </button>

            <button
              v-else
              @click="submitQuiz"
              class="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Nộp bài 📩
            </button>
          </div>
        </div>
      </div>

      <!-- Kết quả -->
      <div
        v-else-if="phase === 'done'"
        class="w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl text-center"
      >
        <h2 class="text-2xl font-bold text-green-600 mb-2">🎯 Kết quả</h2>
        <p class="mb-1"><b>Họ tên:</b> {{ fullName }}</p>
        <p class="mb-4"><b>Vị trí:</b> {{ position }}</p>

        <p class="text-lg">Điểm: <b>{{ score }}</b>/<b>{{ questions.length }}</b></p>
        <p class="text-gray-500 mt-2">
          Tỷ lệ đúng: {{ ((score / questions.length) * 100).toFixed(1) }}%
        </p>

        <div class="mt-6">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            @click="resetExam"
          >
            Làm lại bài khác
          </button>
        </div>
      </div>

      <!-- Lỗi -->
      <div
        v-else-if="phase === 'error'"
        class="w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl"
      >
        <h2 class="text-xl font-semibold text-red-600 mb-2">
          ⚠️ Không tải được bộ câu hỏi
        </h2>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        <button
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          @click="phase = 'intro'"
        >
          Quay lại
        </button>
      </div>
    </div>
  </div>

  <!-- 🔸 Modal câu chưa làm -->
  <div
    v-if="showUnansweredModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <h2 class="text-xl font-bold text-red-600 mb-3 text-center">
        ⚠️ Bạn chưa làm hết câu!
      </h2>
      <p class="text-gray-700 mb-3 text-center">
        Hãy chọn thêm các câu còn thiếu bên dưới 👇
      </p>

      <div class="flex flex-wrap gap-2 justify-center mb-4">
        <button
          v-for="(num, idx) in unansweredList"
          :key="idx"
          @click="goToQuestion(num - 1)"
          class="w-10 h-10 flex items-center justify-center rounded-full font-semibold transition"
          :class="answers[num - 1] ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-indigo-200'"
        >
          {{ num }}
        </button>
      </div>

      <div class="flex justify-center gap-4">
        <button
          class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          @click="showUnansweredModal = false"
        >
          Đóng
        </button>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          @click="checkUnansweredAgain"
        >
          📝 Nộp bài lại
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
import { ref, computed } from "vue";

const QUESTIONS_FILE = "/questions.xlsx";
type Letter = "A" | "B" | "C" | "D";
const letters = ["A", "B", "C", "D"] as const;

type Q = { question: string; A: string; B: string; C: string; D: string; correct: Letter };

const phase = ref<"intro" | "doing" | "done" | "error">("intro");
const starting = ref(false);
const errorMessage = ref("");
const fullName = ref("");
const position = ref("");
const questions = ref<Q[]>([]);
const answers = ref<Letter[]>([]);
const score = ref<number>(0);
const currentIndex = ref(0);
const timeLeft = ref(0);
let timer: any = null;

// Modal
const showUnansweredModal = ref(false);
const unansweredList = ref<number[]>([]);

const currentQuestion = computed(() => questions.value[currentIndex.value]);

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

function pickRandomN<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const startExam = async () => {
  if (!fullName.value || !position.value) return;
  starting.value = true;
  errorMessage.value = "";
  try {
    const res = await fetch(QUESTIONS_FILE);
    if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${QUESTIONS_FILE}`);
    const buffer = await res.arrayBuffer();
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

    const pool: Q[] = rows
      .map((r) => {
        const question = String(r.question ?? r.Question ?? "").trim();
        const A = String(r.optionA ?? r.A ?? "").trim();
        const B = String(r.optionB ?? r.B ?? "").trim();
        const C = String(r.optionC ?? r.C ?? "").trim();
        const D = String(r.optionD ?? r.D ?? "").trim();
        const ans = String(r.answer ?? r.Answer ?? "").trim().toUpperCase();
        return { question, A, B, C, D, correct: (["A", "B", "C", "D"].includes(ans) ? ans : "") as Letter };
      })
      .filter((q) => q.question && q.A && q.B && q.C && q.D && q.correct);

    if (pool.length < 50) throw new Error(`Bộ câu hỏi hợp lệ chỉ có ${pool.length} (cần ≥ 50).`);

    questions.value = pickRandomN(pool, 50);
    answers.value = Array(questions.value.length).fill("" as Letter);
    currentIndex.value = 0;
    timeLeft.value = 50 * 60;
    startTimer();
    phase.value = "doing";
  } catch (err: any) {
    errorMessage.value = err?.message || "Không rõ lỗi";
    phase.value = "error";
  } finally {
    starting.value = false;
  }
};

const nextQuestion = () => currentIndex.value < questions.value.length - 1 && currentIndex.value++;
const prevQuestion = () => currentIndex.value > 0 && currentIndex.value--;

const openUnansweredModal = () => {
  unansweredList.value = questions.value
    .map((_, i) => (!answers.value[i] ? i + 1 : null))
    .filter((n) => n !== null) as number[];
  showUnansweredModal.value = true;
};

const submitQuiz = () => {
  openUnansweredModal();
  if (unansweredList.value.length > 0) return;
  finalizeSubmit();
};

const checkUnansweredAgain = () => {
  unansweredList.value = questions.value
    .map((_, i) => (!answers.value[i] ? i + 1 : null))
    .filter((n) => n !== null) as number[];

  if (unansweredList.value.length === 0) {
    showUnansweredModal.value = false;
    finalizeSubmit();
  }
};

const finalizeSubmit = () => {
  clearInterval(timer);
  let s = 0;
  questions.value.forEach((q, i) => {
    if ((answers.value[i] || "").toUpperCase() === q.correct) s++;
  });
  score.value = s;
  phase.value = "done";
};

const goToQuestion = (index: number) => {
  currentIndex.value = index;
};

const startTimer = () => {
  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
    else {
      clearInterval(timer);
      if (phase.value === "doing") finalizeSubmit();
    }
  }, 1000);
};

const resetExam = () => {
  clearInterval(timer);
  timeLeft.value = 0;
  answers.value = [];
  questions.value = [];
  score.value = 0;
  currentIndex.value = 0;
  phase.value = "intro";
};
</script>
