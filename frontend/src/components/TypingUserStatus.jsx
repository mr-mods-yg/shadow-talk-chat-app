import { useUserStore } from "../store/useUserStore";

// TYPING INDICATOR COMPONENT
export function TypingUserStatus() {
    const { users, typingUsers } = useUserStore();
    const currentTypingUsers = typingUsers.map((id) => users[id].name);
    const currentTypingUsersLength = currentTypingUsers.length;
  
    if (currentTypingUsersLength == 1) {
      return <div>
        {currentTypingUsers} is typing...
      </div>
    }
    else if (currentTypingUsersLength == 2) {
      return <div>
        {currentTypingUsers[0]} and {currentTypingUsers[1]} are typing...
      </div>
    }
    else if (currentTypingUsersLength == 3) {
      const startingThreeUsers = currentTypingUsers.slice(0, 2);
      return <div>
        {startingThreeUsers[0]}, {startingThreeUsers[1]}, {startingThreeUsers[2]} are typing...
      </div>
    }
    else if (currentTypingUsersLength > 3) {
      return <div>
        Several people are typing...
      </div>
    }
    else {
      return <></>
    }
  }