<template>
  <div class="intro-card">
    <!-- Left Column: Light Theme -->
    <div class="card-left">
      <!-- Header Area -->
      <div class="header-section">
        <div class="avatar-container">
          <img src="/avatar.jpg" alt="阿布头像" class="avatar-img" @error="handleAvatarError" />
          <div v-if="avatarFallback" class="avatar-placeholder">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="#E6F4F3"/>
              <circle cx="50" cy="38" r="18" fill="#057A77"/>
              <path d="M20 85 C20 65, 35 56, 50 56 C65 56, 80 65, 80 85 Z" fill="#057A77"/>
            </svg>
          </div>
        </div>
        
        <div class="header-info">
          <h1 class="author-name">阿布</h1>
          <div class="author-title">AI Agent & 企业 AI 落地实践者</div>
          <div class="author-motto">
            用 AI 解决实际问题，创造业务价值
            <span class="motto-underline"></span>
          </div>
        </div>
      </div>

      <!-- 3 Top Feature Cards -->
      <div class="feature-pillars">
        <div class="pillar-item">
          <div class="pillar-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
              <path d="M12 6a6 6 0 0 0-6 6c0 3.3 2.7 6 6 6s6-2.7 6-6a6 6 0 0 0-6-6z"/>
            </svg>
          </div>
          <div class="pillar-text">
            <div class="pillar-title">AI 开发专家</div>
            <div class="pillar-sub">智能体系搭建</div>
          </div>
        </div>

        <div class="pillar-item">
          <div class="pillar-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <circle cx="8" cy="16" r="1" fill="currentColor"/>
              <circle cx="16" cy="16" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div class="pillar-text">
            <div class="pillar-title">AI Agent 架构</div>
            <div class="pillar-sub">从 0 到 1 落地</div>
          </div>
        </div>

        <div class="pillar-item">
          <div class="pillar-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div class="pillar-text">
            <div class="pillar-title">场景驱动落地</div>
            <div class="pillar-sub">聚焦实际价值</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Main Body Grid: 2 Columns on Left Side -->
      <div class="content-grid">
        <!-- Left Side Column inside Light Theme -->
        <div class="grid-col-left">
          <!-- Section 1: 我正在做的事 -->
          <div class="section-block">
            <div class="section-title">
              <span class="title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              我正在做的事
            </div>
            <p class="section-desc">
              专注于 AI Agent 和企业 AI 落地，帮助企业和组织将 AI 技术应用到真实业务场景中，提升效率，创造可衡量的价值。
            </p>
            <div class="tags-group">
              <span class="tag-pill">AI Agent 开发</span>
              <span class="tag-pill">企业 AI 落地</span>
              <span class="tag-pill">智能体系统搭建</span>
            </div>
          </div>

          <!-- Section 2: 我重点关注的领域 -->
          <div class="section-block">
            <div class="section-title">
              <span class="title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </span>
              我重点关注的领域
            </div>

            <div class="focus-cards">
              <div class="focus-card">
                <div class="focus-icon-box green-bg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                </div>
                <div class="focus-info">
                  <div class="focus-title">文旅行业</div>
                  <div class="focus-desc">AI 助力文旅内容生产、智能导览、个性化推荐等场景创新</div>
                </div>
              </div>

              <div class="focus-card">
                <div class="focus-icon-box blue-bg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div class="focus-info">
                  <div class="focus-title">企业服务</div>
                  <div class="focus-desc">企业内部流程自动化、智能知识库、客服与销售赋能等解决方案</div>
                </div>
              </div>

              <div class="focus-card">
                <div class="focus-icon-box purple-bg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="21" x2="21" y2="21"/>
                    <line x1="6" y1="18" x2="6" y2="11"/>
                    <line x1="10" y1="18" x2="10" y2="11"/>
                    <line x1="14" y1="18" x2="14" y2="11"/>
                    <line x1="18" y1="18" x2="18" y2="11"/>
                    <polygon points="12 3 2 9 22 9 12 3"/>
                  </svg>
                </div>
                <div class="focus-info">
                  <div class="focus-title">政策咨询</div>
                  <div class="focus-desc">政策检索与解读、申报材料生成、合规助手等智能化工具</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Column inside Light Theme -->
        <div class="grid-col-right">
          <!-- Box 1: 我的理念 -->
          <div class="idea-box">
            <div class="box-header">
              <span class="box-icon yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
                </svg>
              </span>
              <span class="box-title">我的理念</span>
            </div>
            <p class="idea-content">
              AI 的价值不在于炫技，<br/>
              而在与解决重复性工作，<br/>
              让人把精力放在更有创造力的事情上。
            </p>
          </div>

          <!-- Box 2: 我能为你做什么？ -->
          <div class="service-box">
            <div class="box-header">
              <span class="box-icon teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </span>
              <span class="box-title teal-title">我能为你做什么？</span>
            </div>
            <p class="service-content">
              如果你有重复、繁琐的工作，或者想验证 AI 在你的业务中能否真正落地，欢迎交流！
            </p>
            <p class="service-highlight">
              我很愿意<span class="highlight-badge">免费</span>帮助你验证和实现 AI 应用场景。
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Quote Line -->
      <div class="footer-quote-bar">
        <span class="quote-line"></span>
        <span class="quote-mark">“</span>
        <span class="quote-text">让 AI 成为你的数字同事，而不是另一个工具。</span>
        <span class="quote-mark">”</span>
        <span class="quote-line"></span>
      </div>
    </div>

    <!-- Right Column: Dark Teal Theme -->
    <div class="card-right">
      <!-- Background Graphic Deco -->
      <div class="neural-bg">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" stroke-width="1.5"/>
          <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <path d="M60 80 L100 40 L140 80 L120 130 L80 130 Z" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <circle cx="100" cy="40" r="4" fill="rgba(45, 212, 191, 0.5)"/>
          <circle cx="60" cy="80" r="3" fill="rgba(45, 212, 191, 0.4)"/>
          <circle cx="140" cy="80" r="3" fill="rgba(45, 212, 191, 0.4)"/>
        </svg>
      </div>

      <!-- Section 1: 核心技能 -->
      <div class="dark-section">
        <div class="dark-section-title">
          <span class="dark-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          核心技能
        </div>

        <ul class="skills-list">
          <li v-for="(skill, index) in skills" :key="index" class="skill-item">
            <span class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span class="skill-name">{{ skill }}</span>
          </li>
        </ul>
      </div>

      <div class="dark-divider"></div>

      <!-- Section 2: 项目经验 (部分) -->
      <div class="dark-section">
        <div class="dark-section-title">
          <span class="dark-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          项目经验 (部分)
        </div>

        <div class="projects-list">
          <div v-for="(proj, index) in projects" :key="index" class="project-item">
            <span class="project-dot"></span>
            <div class="project-content">
              <span class="project-name">{{ proj.name }}：</span>
              <span class="project-desc">{{ proj.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dark-divider"></div>

      <!-- Section 3: 联系我 -->
      <div class="dark-section contact-wrapper">
        <div class="contact-left">
          <div class="dark-section-title">
            <span class="dark-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            联系我
          </div>

          <div class="contact-items">
            <div class="contact-item">
              <span class="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </span>
              <span>微信：<strong class="contact-val">abu_ai_solutions</strong></span>
            </div>

            <div class="contact-item">
              <span class="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span>邮箱：<strong class="contact-val">abu.ai.solution@gmail.com</strong></span>
            </div>

            <div class="contact-item">
              <span class="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <span>地点：<strong class="contact-val">深圳</strong></span>
            </div>
          </div>
        </div>

        <!-- QR Code Block -->
        <div class="qrcode-card">
          <div class="qrcode-box">
            <img src="/qrcode.png" alt="微信二维码" class="qrcode-img" @error="handleQrcodeError" />
            <div v-if="qrcodeFallback" class="qrcode-placeholder">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#FFFFFF" rx="6"/>
                <!-- Outer position squares -->
                <path d="M10 10h28v28H10zM62 10h28v28H62zM10 62h28v28H10z" fill="#044747"/>
                <path d="M17 17h14v14H17zM69 17h14v14H69zM17 69h14v14H17z" fill="#FFFFFF"/>
                <path d="M21 21h6v6h-6zM73 21h6v6h-6zM21 73h6v6h-6z" fill="#044747"/>
                <!-- Decorative QR matrix pixels -->
                <path d="M44 10h12v6H44zM44 22h6v12h-6zM52 28h10v6H52zM10 44h18v6H10zM34 44h12v12H34zM52 44h16v6H52zM74 44h16v12H74z" fill="#044747"/>
                <path d="M44 62h12v12H44zM62 62h10v6H62zM78 62h12v12H78zM62 78h10v12H62zM44 80h12v10H44z" fill="#044747"/>
                <circle cx="50" cy="50" r="5" fill="#057A77"/>
              </svg>
            </div>
          </div>
          <div class="qrcode-text">扫码加我交流</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const avatarFallback = ref(false)
const qrcodeFallback = ref(false)

const handleAvatarError = () => {
  avatarFallback.value = true
}

const handleQrcodeError = () => {
  qrcodeFallback.value = true
}

const skills = [
  'LLM 应用与 Prompt 工程',
  'AI Agent 架构设计与实现',
  'RAG / 向量数据库应用',
  '工作流编排与自动化',
  'API 集成与系统对接',
  '数据分析与业务洞察'
]

const projects = [
  {
    name: '文旅智能体',
    desc: '打造旅游问答、行程规划、景点推荐等 AI 助手'
  },
  {
    name: '企业智能助手',
    desc: '构建企业知识库问答、内部流程自动化智能体'
  },
  {
    name: '政策申报助手',
    desc: '政策检索、条件匹配、材料生成的一站式解决方案'
  }
]
</script>

<style scoped>
.intro-card {
  display: flex;
  width: 100%;
  background: #ffffff;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* ================= Left Column (Light Theme) ================= */
.card-left {
  flex: 1.4;
  padding: 40px 44px;
  background: var(--bg-card-left);
  display: flex;
  flex-direction: column;
}

/* Header */
.header-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}

.avatar-container {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-teal);
  box-shadow: 0 4px 12px rgba(5, 122, 119, 0.2);
  flex-shrink: 0;
  position: relative;
  background: #f0fdfa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 34px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.author-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-teal);
  margin-top: 6px;
}

.author-motto {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-top: 6px;
  position: relative;
  display: inline-block;
}

.motto-underline {
  display: block;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-teal) 0%, #2DD4BF 100%);
  border-radius: 2px;
  margin-top: 4px;
}

/* Feature Pillars */
.feature-pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.pillar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #F8FAFA;
  border-radius: var(--radius-md);
  border: 1px solid #EAF2F1;
  transition: var(--transition);
}

.pillar-item:hover {
  transform: translateY(-2px);
  background: #F0F7F6;
  border-color: #D1E7E5;
}

.pillar-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E6F4F3;
  color: var(--primary-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pillar-icon svg {
  width: 22px;
  height: 22px;
}

.pillar-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.pillar-sub {
  font-size: 12px;
  color: #6B7280;
  margin-top: 3px;
}

.divider {
  height: 1px;
  background: #F0F0F0;
  margin-bottom: 28px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 28px;
  flex: 1;
}

/* Sections */
.section-block {
  margin-bottom: 24px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-icon {
  width: 26px;
  height: 26px;
  color: var(--primary-teal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.title-icon svg {
  width: 22px;
  height: 22px;
}

.section-desc {
  font-size: 13.5px;
  color: #4B5563;
  line-height: 1.6;
  margin-bottom: 14px;
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  padding: 5px 14px;
  background: #EAF6F5;
  color: var(--primary-teal);
  border-radius: var(--radius-full);
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid #D2ECEB;
}

/* Focus Area Cards */
.focus-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.focus-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: var(--radius-md);
  border: 1px solid #F3F4F6;
  transition: var(--transition);
}

.focus-card:hover {
  background: #FFFFFF;
  border-color: #E5E7EB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.focus-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.focus-icon-box svg {
  width: 20px;
  height: 20px;
}

.green-bg { background: #059669; }
.blue-bg { background: #0284C7; }
.purple-bg { background: #7C3AED; }

.focus-info {
  display: flex;
  flex-direction: column;
}

.focus-title {
  font-size: 14px;
  font-weight: 700;
  color: #1F2937;
}

.focus-desc {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
  line-height: 1.45;
}

/* Sub Boxes on Right Side of Light Panel */
.idea-box {
  background: #FAFAFB;
  border: 1px dashed #E5E7EB;
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 20px;
}

.box-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.box-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box-icon svg {
  width: 20px;
  height: 20px;
}

.box-icon.yellow { color: #D97706; }
.box-icon.teal { color: var(--primary-teal); }

.box-title {
  font-size: 15px;
  font-weight: 700;
  color: #1F2937;
}

.teal-title {
  color: var(--primary-teal);
}

.idea-content {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.6;
}

.service-box {
  background: #EDF8F7;
  border: 1px solid #D2EFEF;
  border-radius: var(--radius-md);
  padding: 18px;
}

.service-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.55;
  margin-bottom: 10px;
}

.service-highlight {
  font-size: 13px;
  color: #1F2937;
  line-height: 1.5;
}

.highlight-badge {
  font-weight: 800;
  color: var(--primary-teal);
  padding: 0 4px;
  font-size: 14px;
}

/* Footer Quote Bar */
.footer-quote-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid #F3F4F6;
}

.quote-line {
  flex: 1;
  height: 1px;
  background: #E5E7EB;
}

.quote-mark {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-teal);
}

.quote-text {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.2px;
}

/* ================= Right Column (Dark Teal Theme) ================= */
.card-right {
  flex: 1;
  padding: 40px 36px;
  background: var(--bg-card-right);
  color: var(--text-white);
  position: relative;
  display: flex;
  flex-direction: column;
}

.neural-bg {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 180px;
  height: 180px;
  opacity: 0.6;
  pointer-events: none;
}

.dark-section {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}

.dark-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.dark-icon {
  width: 24px;
  height: 24px;
  color: #2DD4BF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-icon svg {
  width: 22px;
  height: 22px;
}

/* Skill List */
.skills-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(45, 212, 191, 0.2);
  color: #2DD4BF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-icon svg {
  width: 12px;
  height: 12px;
}

.skill-name {
  font-size: 14px;
  font-weight: 500;
  color: #E2E8F0;
}

.dark-divider {
  height: 1px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
}

/* Projects List */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.project-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2DD4BF;
  margin-top: 6px;
  flex-shrink: 0;
}

.project-content {
  font-size: 13.5px;
  line-height: 1.5;
}

.project-name {
  font-weight: 700;
  color: #FFFFFF;
}

.project-desc {
  color: #CBD5E1;
}

/* Contact & QR Code Wrapper */
.contact-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 0;
  margin-top: auto;
}

.contact-left {
  flex: 1;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #CBD5E1;
}

.contact-icon {
  width: 18px;
  height: 18px;
  color: #2DD4BF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon svg {
  width: 16px;
  height: 16px;
}

.contact-val {
  color: #FFFFFF;
  font-weight: 600;
}

/* QR Code Card */
.qrcode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  padding: 10px;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.qrcode-box {
  width: 100px;
  height: 100px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-placeholder {
  width: 100%;
  height: 100%;
}

.qrcode-text {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--primary-teal-dark);
  margin-top: 6px;
}

/* ================= Responsive Layout ================= */
@media (max-width: 960px) {
  .intro-card {
    flex-direction: column;
  }
  
  .card-left {
    padding: 28px 24px;
  }
  
  .card-right {
    padding: 28px 24px;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-pillars {
    grid-template-columns: 1fr;
  }
}
</style>
