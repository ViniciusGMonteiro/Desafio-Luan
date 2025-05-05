document.addEventListener("DOMContentLoaded", () => {
    // Inicializar os ícones do Lucide
    const lucide = window.lucide // Declara a variável lucide
    lucide.createIcons()
  
    // Elementos do DOM
    const form = document.getElementById("uploadForm")
    const emailInput = document.getElementById("email")
    const fileInput = document.getElementById("fileInput")
    const fileInfo = document.getElementById("fileInfo")
    const submitBtn = document.getElementById("submitBtn")
    const errorMessage = document.getElementById("errorMessage")
    const errorText = document.getElementById("errorText")
    const successMessage = document.getElementById("successMessage")
    const successText = document.getElementById("successText")
    const progressContainer = document.getElementById("progressContainer")
    const progressBar = document.getElementById("progressBar")
    const progressText = document.getElementById("progressText")
  
    // Constantes
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB em bytes
    const SMASH_API_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGZlMjUzLTM5YTItNGQzNS04MDhkLThmODBmZjY0NTc4Mi1ldSIsInVzZXJuYW1lIjoiNGQ4ZjQ2ZmUtMmY3OS00N2JlLWE1ODUtYzU3NjhjYTJjYWM0IiwicmVnaW9uIjoidXMtZWFzdC0xIiwiaXAiOiIyODA0OjQxNjA6ZjgwYzplYjAwOmU4YWY6ZWRmOTo1ZDVmOmU4ODMiLCJzY29wZSI6Ik5vbmUiLCJhY2NvdW50IjoiOTExOWYyYmYtMTc1MS00ZWVkLWE5OTktZTMyNzhmMTc4NGFmLWVhIiwiaWF0IjoxNzQ2NDU2NDIwLCJleHAiOjQ5MDIyMTY0MjB9.R84q4bPMhhB-zg5nHkZNqkFZyVPrVOBJipnaBdwgZCw"
  
    // Variáveis
    let smashUploader = null
    let isSmashLoaded = false
  
    // Inicializar o SmashUploader
    try {
      if (window.SmashUploader) {
        smashUploader = new window.SmashUploader({
          apiKey: SMASH_API_KEY,
        })
        isSmashLoaded = true
        console.log("SmashUploader inicializado com sucesso")
      } else {
        console.warn("SmashUploader não está disponível")
      }
    } catch (error) {
      console.error("Erro ao inicializar o SmashUploader:", error)
    }
  
    // Formatar tamanho do arquivo
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B"
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
      else return (bytes / 1048576).toFixed(1) + " MB"
    }
  
    // Mostrar mensagem de erro
    function showError(message) {
      errorText.textContent = message
      errorMessage.classList.remove("hidden")
      setTimeout(() => {
        errorMessage.classList.add("hidden")
      }, 5000)
    }
  
    // Mostrar mensagem de sucesso
    function showSuccess(message) {
      successText.textContent = message
      successMessage.classList.remove("hidden")
    }
  
    // Atualizar barra de progresso
    function updateProgress(progress) {
      progressBar.style.width = `${progress}%`
      progressText.textContent = `${progress}% concluído`
  
      if (progress > 0) {
        progressContainer.classList.remove("hidden")
      }
  
      if (progress >= 100) {
        setTimeout(() => {
          progressContainer.classList.add("hidden")
        }, 1000)
      }
    }
  
    // Simular upload (fallback quando o SmashUploader não está disponível)
    function simulateUpload(email, file) {
      submitBtn.disabled = true
      submitBtn.innerHTML = "Enviando..."
      errorMessage.classList.add("hidden")
      successMessage.classList.add("hidden")
  
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        updateProgress(progress)
  
        if (progress >= 100) {
          clearInterval(interval)
          showSuccess(`Arquivo enviado com sucesso para ${email}!`)
  
          // Resetar formulário
          form.reset()
          fileInfo.classList.add("hidden")
          submitBtn.innerHTML = '<i data-lucide="paper-plane"></i>Enviar Arquivo'
          submitBtn.disabled = false
          lucide.createIcons() // Recriar ícones após alterar o HTML
        }
      }, 300)
    }
  
    // Realizar upload real com SmashUploader
    async function performUpload(email, file) {
      submitBtn.disabled = true
      submitBtn.innerHTML = "Enviando..."
      errorMessage.classList.add("hidden")
      successMessage.classList.add("hidden")
      updateProgress(0)
  
      try {
        // Parâmetros de upload
        const uploadParams = {
          file: file,
          recipients: [email],
          onProgress: (progress) => {
            updateProgress(Math.round(progress))
          },
        }
  
        // Realizar upload
        const response = await smashUploader.upload(uploadParams)
  
        // Tratar sucesso
        showSuccess(`Arquivo enviado com sucesso para ${email}!`)
  
        // Resetar formulário
        form.reset()
        fileInfo.classList.add("hidden")
      } catch (error) {
        console.error("Erro no upload:", error)
        showError("Erro ao enviar o arquivo. Por favor, tente novamente.")
      } finally {
        submitBtn.innerHTML = '<i data-lucide="paper-plane"></i>Enviar Arquivo'
        submitBtn.disabled = false
        lucide.createIcons() // Recriar ícones após alterar o HTML
      }
    }
  
    // Manipular seleção de arquivo
    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        const file = this.files[0]
  
        // Verificar tamanho do arquivo
        if (file.size > MAX_FILE_SIZE) {
          showError("O arquivo excede o limite de 5MB. Por favor, selecione um arquivo menor.")
          fileInput.value = ""
          fileInfo.classList.add("hidden")
        } else {
          // Exibir informações do arquivo
          fileInfo.textContent = `Arquivo selecionado: ${file.name} (${formatFileSize(file.size)})`
          fileInfo.classList.remove("hidden")
        }
      } else {
        fileInfo.classList.add("hidden")
      }
    })
  
    // Manipular envio do formulário
    form.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const email = emailInput.value
      const file = fileInput.files[0]
  
      // Validar arquivo
      if (!file) {
        showError("Por favor, selecione um arquivo para enviar.")
        return
      }
  
      if (file.size > MAX_FILE_SIZE) {
        showError("O arquivo excede o limite de 5MB. Por favor, selecione um arquivo menor.")
        return
      }
  
      // Verificar se o SmashUploader está disponível
      if (isSmashLoaded && smashUploader) {
        performUpload(email, file)
      } else {
        console.warn("SmashUploader não disponível, usando simulação")
        simulateUpload(email, file)
      }
    })
  })
  