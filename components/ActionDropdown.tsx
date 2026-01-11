"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Models } from "node-appwrite";
import { FileDetails } from "./ActionsModalContent";
import Image from "next/image";
import Link from "next/link";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ShareInput } from "./ActionsModalContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  renameFile,
  updateFileUsers,
  deleteFile,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setisLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const path = usePathname();
  const closeAllModals = () => {
    setisModalOpen(false);
    setisDropdownOpen(false);
    setAction(null);
    setName(file.name);
  };
  const handleAction = async () => {
    if (!action) return;
    setisLoading(true);
    let success = false;
    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
    };
    success = await actions[action.value as keyof typeof actions]();
    if (success) {
      closeAllModals();
    }
    setisLoading(false);
  };
  const handleRemoveUser = async (email: string) => {
    const updatedEmail = emails.filter((e) => {
      e !== email;
    });
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmail,
      path,
    });
    if (success) {
      setEmails(updatedEmail);
      closeAllModals();
    }
  };
  const renderDialogContent = () => {
    if (!action) return null;
    const { label, value } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="w-full rounded-md border border-light-200 bg-light-50 px-3 py-2 text-light-900 focus:outline-none focus:ring-2 focus:ring-light-500"
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{" "}
              <span className="delete-file-name">{file.name}</span>
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        setisModalOpen(open);
        if (!open) {
          setAction(null);
          setisDropdownOpen(false);
        }
      }}
    >
      <DropdownMenu open={isDropdownOpen} onOpenChange={setisDropdownOpen}>
        <DropdownMenuTrigger>
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(item);
                if (
                  ["rename", "share", "delete", "details"].includes(item.value)
                ) {
                  // ensure dropdown closes before opening dialog
                  setisDropdownOpen(false);
                  setisModalOpen(true);
                }
              }}
            >
              {item.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
