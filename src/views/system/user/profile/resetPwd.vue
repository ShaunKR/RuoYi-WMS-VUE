<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="현재 비밀번호" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="입력해 주세요:현재 비밀번호" type="password" show-password />
      </el-form-item>
      <el-form-item label="새 비밀번호" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="입력해 주세요:새 비밀번호" type="password" show-password />
      </el-form-item>
      <el-form-item label="비밀번호 확인" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="새 비밀번호를 다시 입력해 주세요." type="password" show-password/>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">저장</el-button>
      <el-button type="danger" @click="close">닫기</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserPwd } from "@/api/system/user";

const { proxy } = getCurrentInstance();

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("비밀번호가 일치하지 않습니다."));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "현재 비밀번호를 입력해 주세요.", trigger: "blur" }],
  newPassword: [{ required: true, message: "새 비밀번호를 입력해 주세요.", trigger: "blur" }, { min: 6, max: 20, message: "허용 길이: 6 ~ 20 자", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "비밀번호 확인항목은 필수입니다.", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** 저장버튼 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("수정되었습니다.");
      });
    }
  });
};
/** 닫기버튼 */
function close() {
  proxy.$tab.closePage();
};
</script>
