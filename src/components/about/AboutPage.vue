<script setup>
  import SiteHeading from '../common/SiteHeading.vue'
</script>

<template>
  <main>
    <SiteHeading>Who Are We</SiteHeading>
    <div class="about-intro">
      <div class="about-image">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 208 135"><path fill="#231F20" d="M203.136 79.5046c4.005-5.7256 5.539-12.6685 4.322-19.5497-.35-1.979-.948-3.9511-1.779-5.8656-3.215-7.9832-9.38-15.0976-17.474-20.2098C178.245 14.2201 157.132.640259 136.197.640259c-12.017 0-23.066 4.774541-31.653 13.563341C95.9554 5.4148 84.9063.640259 72.8896.640259 50.3385.640259 28.0509 16.14 19.0988 37.7744 10.848 43.3476 4.90009 51.0083 2.24589 59.5391c-.04529.1468-.08646.295-.11803.4199-.49131 1.581-.83029 3.1936-1.0087 4.7979-.753445 6.7933 1.18438 13.4741 5.45525 18.8127 1.13908 1.4218 2.41265 2.7064 3.80839 3.8455l-1.36279 9.6808c-.09607.575-.59151 3.4871-1.26398 6.4201-1.71412 7.475.04668 15.206 4.82947 21.212 4.7924 6.012 11.9494 9.461 19.6361 9.461h.3033c4.3875 0 8.679-1.154 12.449-3.306 3.7644 2.153 8.0531 3.306 12.4571 3.306h4.9928c4.415 0 8.7174-1.161 12.5052-3.341 3.7823 2.176 8.0902 3.341 12.5107 3.341 6.42 0 12.5203-2.519 17.1023-6.792 4.583 4.273 10.684 6.792 17.103 6.792 4.419 0 8.726-1.165 12.508-3.339 3.78 2.174 8.089 3.339 12.509 3.339h4.993c4.403 0 8.693-1.153 12.459-3.306 3.768 2.152 8.06 3.306 12.447 3.306h.302c7.688 0 14.844-3.449 19.638-9.463 4.783-6.004 6.542-13.735 4.829-21.21-.657-2.867-1.146-5.712-1.265-6.4242l-1.743-12.3845c1.831-1.5014 3.442-3.2402 4.814-5.2027Z"/><path fill="#fff" d="M100.44 34.4616c-1.2656-4.9653-3.5067-9.6246-6.5987-13.7033-5.9932-7.7499-13.7348-10.88721-20.9509-10.88721-18.0867 0-36.5055 16.05011-39.0362 34.01331l-.6972 4.9557c-5.7585 2.7626-11.3922 8.0545-13.282 14.1274 0 0 .0083.0068.0247.0192-.2099.553-.3623 1.1377-.4309 1.7525-.4337 3.9141 2.3866 7.4384 6.3007 7.8734 1.4917.1647 2.9259-.1455 4.1555-.8056l-2.6542 18.8457s-.6148 3.8029-1.5206 7.7567c-.9497 4.1416 2.2219 8.0876 6.4722 8.0876h.302c1.5727 0 3.0933-.559 4.2928-1.576l4.3793-3.716c2.8079-2.3825 7.0184-2.0216 9.3803.803l1.7649 2.111c1.2612 1.506 3.1249 2.378 5.0888 2.378h4.9927c1.6071 0 3.1593-.583 4.3683-1.641l4.1625-3.643c2.7407-2.3987 6.9004-2.1394 9.3226.581l2.2096 2.481c1.2585 1.414 3.0618 2.222 4.9543 2.222 3.3061 0 6.1085-2.435 6.5683-5.709l1.4259-10.1353 5.7683-40.9906c.76-5.0668.502-10.2352-.763-15.2005ZM183.045 70.042c4.187-.7411 6.98-4.7347 6.239-8.9219-.133-.7548-.376-1.4616-.703-2.1135-2.241-5.624-7.499-10.3999-13.073-13.1914l-.272-1.9296c-2.531-17.9632-20.95-34.01463-39.035-34.01463-7.217 0-14.959 3.13593-20.952 10.88583v.0027c-3.092 4.0787-5.333 8.738-6.599 13.7033-1.265 4.9653-1.523 10.1324-.763 15.2006l5.768 40.9905 1.426 10.1351c.461 3.273 3.262 5.709 6.569 5.709 1.893 0 3.695-.808 4.954-2.222l2.209-2.482c2.423-2.7191 6.584-2.9785 9.323-.581l4.163 3.642c1.209 1.06 2.761 1.643 4.368 1.643h4.993c1.964 0 3.827-.871 5.088-2.378l1.765-2.111c2.362-2.8257 6.573-3.1852 9.381-.803l4.379 3.717c1.199 1.017 2.72 1.575 4.293 1.575h.302c4.25 0 7.422-3.945 6.472-8.0887-.906-3.9525-1.521-7.7554-1.521-7.7554l-2.963-21.0483c1.286.5146 2.724.6958 4.189.4364Z"/><path fill="#231F20" d="m87.6636 47.7203-19.5401-8.0572c-.6093-.2526-1.2557-.3775-1.9008-.3775-.7246 0-1.4478.1592-2.1176.4721-1.2667.5957-2.2246 1.6949-2.6418 3.0303-.7603 2.4428-1.0732 5.2686-1.0101 9.1621.1647 10.3574 5.985 16.0185 11.6791 17.034.8193.1455 1.6496.2196 2.4689.2196 7.8473 0 14.6132-6.77 16.0858-16.0981.3595-2.2782-.8907-4.5055-3.0234-5.3853ZM146.251 42.7836c-.336-1.4122-1.271-2.6062-2.559-3.2732-.717-.3705-1.502-.5572-2.289-.5572-.632 0-1.263.1194-1.861.361l-19.962 8.0312c-2.263.9113-3.535 3.3267-3.004 5.7078 2.023 9.0866 8.125 14.959 15.541 14.959.907 0 1.828-.0933 2.737-.2745 4.467-.8934 10.144-4.1597 11.821-14.6447.603-3.7645.149-7.9077-.424-10.3094Z"/></svg>
      </div>
      <div class="about-text">
        <p>Gotchi Battler has been meticulously built with dedication and a deep appreciation for the Aavegotchi community. The hard work invested by our team transcends mere development, it's a labor of love, a collective endeavor to create something truly special for the community that brought us together.</p>
        <p>To all the players, we extend our deepest gratitude and hope that you find as much joy in playing this game as we have found in creating it for you. LFGotchi.</p>
      </div>
    </div>
    <div class="about-team">
      <h2>
        Team
      </h2>
      <ul class="list-reset">
        <li>
          <div class="team-image-container">
            <img src="./immaterial.svg" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              Immaterial
            </div>
            <div class="team-member-role">
              Vision / Coding
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./coinmandeer.svg" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              coinmandeer
            </div>
            <div class="team-member-role">
              Design
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./maxicrouton.svg" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              Maxicrouton
            </div>
            <div class="team-member-role">
              Backend / Contracts
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./eitri.png" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              eitri
            </div>
            <div class="team-member-role">
              Frontend
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./deadfolk.webp" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              DeadFolk
            </div>
            <div class="team-member-role">
              Unity
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./wildfyr.png" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              Wildfyr
            </div>
            <div class="team-member-role">
              Battle mechanics
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./laggin.png" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              Laggin
            </div>
            <div class="team-member-role">
              Art
            </div>
          </div>
        </li>
        <li>
          <div class="team-image-container">
            <img src="./bowtienerd.png" />
          </div>
          <div class="team-member-text">
            <div class="team-member-name">
              Bowtienerd
            </div>
            <div class="team-member-role">
              Docs
            </div>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
  .about-intro {
    margin-top: 3rem;
    display: grid;
    grid-template-columns: minmax(20%, 18rem) minmax(0, 1fr);
    gap: 2.4rem;
  }
  .about-image {
    display: grid;
    place-items: center;
    background-color: var(--c-bright-purple);
    aspect-ratio: 1 / 1;
    align-self: center;
  }
  .about-image svg {
    width: 66%;
  }
  .about-text {
    font-size: 1.125rem;
    line-height: 2rem;
    letter-spacing: 0.1125rem;
    max-width: 630px;
  }

  .about-team {
    margin-top: 3rem;
  }
  .about-team h2 {
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  .about-team ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(12.5rem, 100%), 1fr));
    gap: 1.5rem;
  }
  .about-team li {
    border: 4px solid #641FEE;
    background-color: rgb(38, 25, 97);
    text-align: center;
  }
  .team-image-container {
    width: 100%;
    max-width: 100%;
  }
  .team-image-container img {
    width: 100%;
  }
  .team-member-text {
    display: grid;
    place-items: center;
    padding: 1.5rem 1rem;
  }
  .team-member-name {
    font-size: 1.5rem;
    line-height: 1.75rem;
    letter-spacing: 0.045rem;
  }
  .team-member-role {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
    opacity: 0.5;
  }
</style>