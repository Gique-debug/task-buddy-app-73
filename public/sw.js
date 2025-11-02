// Service Worker pour les notifications de tâches
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Gérer les messages du client
self.addEventListener('message', async (event) => {
  if (event.data.type === 'CHECK_SCHEDULED_TASKS') {
    const todos = event.data.todos;
    const now = new Date();
    
    for (const todo of todos) {
      if (
        todo.scheduledFor &&
        !todo.notified &&
        !todo.completed &&
        new Date(todo.scheduledFor) <= now
      ) {
        // Afficher la notification native
        await self.registration.showNotification('⏰ Rappel de tâche !', {
          body: todo.text,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: todo.id,
          requireInteraction: true,
          data: { todoId: todo.id }
        });
        
        // Informer le client que la tâche a été notifiée
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'TASK_NOTIFIED',
            todoId: todo.id
          });
        });
      }
    }
  }
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Ouvrir ou focus sur l'application
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
