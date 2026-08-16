import { useCallback, useState } from 'react'
import ChatWindow from './components/ChatWindow'
import EmptyState from './components/EmptyState'
import PersonalityModal from './components/PersonalityModal'
import Sidebar from './components/Sidebar'
import { useAppStore } from './hooks/useAppStore'
import { unlockAudio } from './lib/sound'

export default function App() {
  const store = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const activeConversation = store.conversations.find((c) => c.id === store.activeConversationId)
  const activePersonality = activeConversation ? store.personalityById(activeConversation.personality_id) : null

  const handleSelectConversation = useCallback(
    (id) => {
      store.setActiveConversationId(id)
      setSidebarOpen(false)
    },
    [store],
  )

  const handleDeleteConversation = useCallback(
    (id) => {
      if (window.confirm('Delete this conversation? This only removes it from this browser.')) {
        store.deleteConversation(id)
      }
    },
    [store],
  )

  return (
    <div
      className="flex h-dvh overflow-hidden bg-(--color-bg)"
      onClickCapture={unlockAudio}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={store.conversations}
        personalityById={store.personalityById}
        activeConversationId={store.activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => {
          setModalOpen(true)
          setSidebarOpen(false)
        }}
        onDeleteConversation={handleDeleteConversation}
      />

      {activeConversation && activePersonality ? (
        <ChatWindow
          key={activeConversation.id}
          conversation={activeConversation}
          personality={activePersonality}
          isSending={store.isSending(activeConversation.id)}
          error={store.errorFor(activeConversation.id)}
          onSend={store.sendMessage}
          onOpenMenu={() => setSidebarOpen(true)}
        />
      ) : (
        <EmptyState
          hasConversations={store.conversations.length > 0}
          onNewChat={() => setModalOpen(true)}
          onOpenMenu={() => setSidebarOpen(true)}
        />
      )}

      <PersonalityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        personalities={store.personalities}
        onCreatePersonality={store.createPersonality}
        onStartConversation={store.startConversation}
      />
    </div>
  )
}
