export const samplerMap = new Map([
  ["Euler a", ["euler_ancestral"]],
  ["Euler", ["euler"]],
  ["LMS", ["lms"]],
  ["Heun", ["heun"]],
  ["DPM2", ["dpm_2"]],
  ["DPM2 a", ["dpm_2_ancestral"]],
  ["DPM++ 2S a", ["dpmpp_2s_ancestral"]],
  ["DPM++ 2M", ["dpmpp_2m"]],
  ["DPM++ SDE", ["dpmpp_sde", "dpmpp_sde_gpu"]],
  ["DPM++ 2M SDE", ["dpmpp_2m_sde"]],
  ["DPM fast", ["dpm_fast"]],
  ["DPM adaptive", ["dpm_adaptive"]],
  ["LMS Karras", ["lms_karras"]],
  ["DPM2 Karras", ["dpm_2_karras"]],
  ["DPM2 a Karras", ["dpm_2_ancestral_karras"]],
  ["DPM++ 2S a Karras", ["dpmpp_2s_ancestral_karras"]],
  ["DPM++ 2M Karras", ["dpmpp_2m_karras"]],
  ["DPM++ SDE Karras", ["dpmpp_sde_karras"]],
  ["DPM++ 2M SDE Karras", ["dpmpp_2m_sde_karras"]],
  ["DDIM", ["ddim"]],
  ["PLMS", ["plms"]],
  ["UniPC", ["uni_pc", "uni_pc_bh2"]],
  ["LCM", ["lcm"]],
]);
